import tonos_ts4.ts4 as ts4, json
eq = ts4.eq
bt = 1000000

ts4.init('../build/', verbose = True)
ts4.G_WARN_ON_UNEXPECTED_ANSWERS = True

assert eq('0.2.1', ts4.__version__)

print("==================== Initialization ====================")

# Load some ABI beforehand to dismiss 'Unknown message' warnings
ts4.register_abi('Padawan')
ts4.register_abi('TONTokenWallet')
ts4.register_abi('RootTokenContract')
# ts4.register_abi('Proposal')

helper  = ts4.BaseContract('Helper', {}, nickname = 'helper')

smcTestRoot = ts4.BaseContract('TestRoot', {}, nickname = 'TestRoot')

(private_key, public_key) = ts4.make_keypair()
smcSafeMultisigWallet = ts4.BaseContract('SafeMultisigWallet',
        ctor_params = dict(
            reqConfirms = 0,
            owners      = [public_key],
        ),
        pubkey      = public_key,
        private_key = private_key,
        nickname     = 'wallet',
    )

print("> deploy and init DemiurgeStore")
smcDemiurgeStore = ts4.BaseContract('DemiurgeStore', {}, nickname = 'demiurgeStore')

def load_image(name):
    code = ts4.load_code_cell('../build/{}.tvc'.format(name))
    return helper.call_getter('make_image_cell', dict(code = code))

demiurgeImage = load_image('Demiurge')
proposalImage = load_image('Proposal')
padawanImage  = load_image('Padawan')

smcDemiurgeStore.call_method('setDemiurgeImage', {'image': demiurgeImage})
smcDemiurgeStore.call_method('setProposalImage', {'image': proposalImage})
smcDemiurgeStore.call_method('setPadawanImage',  {'image': padawanImage})

ts4.dispatch_messages()



ttwImage = ts4.core.load_code_cell('../build/TONTokenWallet.tvc')

smcRT = ts4.BaseContract('RootTokenContract', ctor_params = dict(
            name = ts4.str2bytes('test'),
            symbol = ts4.str2bytes('test'),
            decimals = 0,
            root_public_key = public_key,
            root_owner = '0x0',
            wallet_code= ttwImage,
            total_supply= 21000000
        ),
        pubkey = public_key,
        private_key = private_key,
        nickname = 'RootTokenContract',
    )
ts4.dispatch_messages()

print("==================== deploy and init Demiurge ==================== ")
print(smcDemiurgeStore.addr())

demiurge = ts4.BaseContract('Demiurge',  ctor_params = None,
        pubkey      = public_key,
        private_key = private_key,
        nickname     = 'demiurge',
    )

demiurge.call_method('constructor', dict(
      store = smcDemiurgeStore.addr(),
      densRoot = smcTestRoot.addr(),
      tokenRoot = smcRT.addr()
), private_key = private_key)

ts4.set_verbose(False)
ts4.dispatch_messages()
ts4.set_verbose(True)

images = demiurge.call_getter('getImages', {})

assert eq(['padawan', 'proposal'], list(images.keys()))
assert eq(padawanImage,  images['padawan'])
assert eq(proposalImage, images['proposal'])


print("==================== deploy and init tip3 ====================")



walletAddress = smcRT.call_method('deployWallet', {
      '_answer_id': 1,
      'workchain_id': 0,
      'pubkey': public_key,
      'internal_owner': 0,
      'tokens': 21000000,
      'grams': 5*ts4.GRAM,
    },private_key=private_key )
ts4.dispatch_messages()

smcTTWUser = ts4.BaseContract('TONTokenWallet', None, address=walletAddress,
        pubkey = public_key,
        private_key = private_key,
        nickname = 'TokenWallet',
    )

print("==================== deploy and init Padawan ====================")

## Encode payload
payload = helper.call_getter('encode_deployPadawan_call', dict(pubkey = public_key))
ts4.dispatch_messages()

params = dict(
        dest = demiurge.addr(),
        value = 15_500_000_000,
        bounce = False,
        flags = 3,
        payload = payload
    )
print(ts4.get_balance(smcSafeMultisigWallet.addr()))

smcSafeMultisigWallet.call_method('sendTransaction', params, private_key = private_key)

ts4.dispatch_messages()

padawanAddress = (demiurge.call_getter_raw('getDeployed',{}))['padawans'][public_key]['addr']

smcPadawan = ts4.BaseContract('Padawan', None,
        address = ts4.Address(padawanAddress),
        nickname = 'PadawanWallet',
    )

# Ensure Padawan has correct balance
smcPadawan.ensure_balance((5-2)*ts4.GRAM)


#payloadCreateTokenAccount = helper.call_getter('encode_createTokenAccount_call', {'tokenRoot': smcRT.addr()})

#smcSafeMultisigWallet.call_method('sendTransaction', dict(
#        dest = smcPadawan.addr(),
#        value = 6_000_000_000,
#        bounce = False,
#        flags = 1,
#        payload = payloadCreateTokenAccount
#    ), private_key=private_key)
#ts4.dispatch_messages()

TTWAddr = smcPadawan.call_getter_raw('getTokenAccounts')['allAccounts'][smcRT.addr().str()]['addr']
TTWAddr = ts4.Address(TTWAddr)
print(TTWAddr)

smcTTWPadawan = ts4.BaseContract('TONTokenWallet', None, address=TTWAddr, pubkey = public_key,
        private_key = private_key)

ts4.dump_js_data()

TOKEN_DEPOSIT = 21000000

smcTTWUser.call_method('transfer', dict(
        dest = smcTTWPadawan.addr(),
        tokens = TOKEN_DEPOSIT,
        grams = 1*ts4.GRAM), private_key = private_key)

print(smcRT.addr().str().replace('0:', '0x'))

payloadDepositTokens =  helper.call_getter('encode_depositTokens_call', dict(
    returnTo = smcTTWUser.addr(),
    tokenId = smcRT.addr().str().replace('0:', '0x'),
    tokens = TOKEN_DEPOSIT))


smcSafeMultisigWallet.call_method('sendTransaction',  dict(
        dest = smcPadawan.addr(),
        value = 5_000_000_000,
        bounce = True,
        flags = 3,
        payload = payloadDepositTokens
    ), private_key = private_key)

ts4.dispatch_one_message()
ts4.dispatch_one_message()
ts4.dispatch_one_message()
# ts4.core.set_trace(True)
ts4.dispatch_one_message()
ts4.dispatch_messages()


print("==================== deploy and init Proposal ====================")


payloadDeployReserveProposal = helper.call_getter('encode_deployReserveProposal_call',  {
        'start': 15457300 + 5,
        'end': 1545730 + 180 + 60 * 60 * 7,
        'title': '74657374',
        'specific': {
          'name': '74657374',
          'ts': 1545730,
        },
})

params = dict(
        dest = demiurge.addr(),
        value = 5_000_000_000,
        bounce = False,
        flags = 3,
        payload = payloadDeployReserveProposal
    )

smcSafeMultisigWallet.call_method('sendTransaction', params, private_key = private_key)

ts4.core.set_now(bt)
