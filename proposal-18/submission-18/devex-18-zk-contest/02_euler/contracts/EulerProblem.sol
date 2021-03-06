/*
  Implementation of contract EulerProblem
 */

pragma ton-solidity >= 0.32.0;

pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./IEulerRoot.sol";
import "./IEulerProblem.sol";
import "Blueprint.sol";

contract EulerProblem is IEulerProblem, Blueprint {

  uint64 constant EXN_AUTH_FAILED = 100 ;
  uint64 constant EXN_WRONG_PROBLEM = 101 ;
  uint64 constant EXN_NOT_ENOUGH_VALUE = 102 ;

  event ProblemSolved( uint256 pubkey );
  
  uint32 constant PRIMARY_INPUT_SIZE = 4;

  uint32 static s_problem ;
  address static s_root_contract ;
  mapping( uint256 => uint8 ) g_top10 ;
  uint8 g_ntop ;
  
  // The verification key of ZkSnarks
  bytes g_verifkey ;
  // The circuit itself (compressed with gz, please)
  bytes g_zip_provkey ;
  // The nonce used with this problem
  string g_nonce ;
  
  // The title of the problem
  string g_title ;
  // The description of the problem 
  string g_description ;
  // The url of the problem 
  string g_url ;
  
  /// @dev constructor of the contract, associated with an Euler problem
  /// @param verifkey The Groth16 verification key of the problem
  /// @param zip_provkey A compressed version of the Groth16 proving key
  ///    of the problem, used to create a submission locally
  /// @param nonce The nonce that the user must provide with his submission
  /// @param title The title of the problem
  /// @param description The description of the problem
  /// @param url The link to the problem official description
  constructor( bytes verifkey, bytes zip_provkey, string nonce, 
               string title, string description, string url ) public
  {
    require( msg.sender == s_root_contract, EXN_AUTH_FAILED );
    
    g_verifkey = verifkey ;
    g_zip_provkey = zip_provkey ;
    g_nonce = nonce ;
    
    g_title = title ;
    g_description = description ;
    g_url = url ;
  }

  /// @dev updates the Blueprint circuit associated with a given problem. Only
  ///   called by the EulerRoot smart contract.x
  /// @param verifkey: the new verification key of the circuit
  /// @param zip_provkey: the new proving key of the circuit to be used to
  ///   generate submission proofs
  /// @param nonce: the nonce to be used to generate submission proofs
  function update_circuit( bytes verifkey,
                           bytes zip_provkey,
                           string nonce ) public
  {
    require( msg.sender == s_root_contract, EXN_AUTH_FAILED );
    g_verifkey = verifkey ;
    g_zip_provkey = zip_provkey ;
    g_nonce = nonce ;
  }
  
  /// @dev Updates the description of a problem. Only called by the EulerRoot
  ///   smart contract.
  /// @param title: the new title of the problem or empty string
  /// @param description: the new description of the problem or empty string
  /// @param url: the new url of the problem or empty string
  function update_problem( string title, string description, string url ) public
  {
    require( msg.sender == s_root_contract, EXN_AUTH_FAILED );
    if( title != "" ) { g_title = title ; }
    if( description != "" ) { g_description = description ; }
    if( url != "" ) { g_url = url ; }
  }

  /// @dev Submit a solution to the problem, providing the 'proof.bin'
  ///   content generated by euler-client C++ program and the associated
  ///   pubkey of the user. This function can be called directly, or through
  ///   the EulerRoot contract. The function verifies the correctness of the
  ///   proof for the given pubkey, records the pubkey if it is in the Top 10,
  ///   emits an event and call back the EulerRoot contract for further
  ///   processing.
  /// @param problem: number of the problem
  /// @param proof: the 'proof.bin' generated by euler-client
  /// @param pubkey: the pubkey of the user, as used when generating
  ///   'proof.bin'
  function submit( uint32 problem, bytes proof, uint256 pubkey) public 
  {
    require( s_problem == problem, EXN_WRONG_PROBLEM );
    require( msg.value > 0.5 ton, EXN_NOT_ENOUGH_VALUE );
    (bool verified, ) = check( proof, pubkey );
    if( verified ){
      if( g_ntop < 10 ){
        optional( uint8 ) opt = g_top10.fetch( pubkey );
        if( ! opt.hasValue() ){
          g_ntop ++;
          g_top10 [ pubkey ] = g_ntop ;
        }
      }
      emit ProblemSolved ( pubkey );
      IEulerRoot( s_root_contract ).
        has_solved{ flag:64 }( s_problem, pubkey );
    } else {
      msg.sender.transfer({ value: 0, flag:64 });
    }
  }

  function verify(bytes value) public view returns (bool is_correct){
    require( msg.pubkey() == tvm.pubkey() );
    tvm.accept();
    return tvm.vergrth16(value);
  }

  function vergrth16(bytes value) public pure returns (bool is_correct){
    return tvm.vergrth16(value);
  }

  function get() public view returns (
                                      address root_contract ,
                                      uint32 problem ,
                                      bytes verifkey ,
                                      bytes zip_provkey ,
                                      string nonce,
                                      string title,
                                      string description,
                                      string url,
                                      uint256[] top10
                                      )
  {
    root_contract = s_root_contract ;
    problem = s_problem ;
    verifkey = g_verifkey ;
    zip_provkey = g_zip_provkey ;
    nonce = g_nonce ;
    title = g_title ;
    description = g_description ;
    url = g_url ;
    
    top10 = new uint256[]( g_ntop );
    optional( uint256, uint8 ) opt = g_top10.min() ;
    for(uint i = 0; i<g_ntop; i++){
      ( uint256 pubkey, uint8 index ) = opt.get() ;
      top10 [ index-1 ] = pubkey ;
      opt = g_top10.next( pubkey ) ;
    }
  }

  /// @dev checks a proof and pubkey with the verification key
  /// provided for the problem
  function check( bytes proof, uint256 pubkey) public view
    returns (bool verified, string blob_str) {

    bytes primary_input = primary_input_of_pubkey( pubkey );

    verified = false ;

    blob_str = proof;
    blob_str.append( primary_input );
    blob_str.append( g_verifkey );
    verified = tvm.vergrth16( blob_str ) ;
  }

  /// @dev translates a pubkey into primary_input. In this version, we
  /// use only 124 bits from the pubkey, stored in 4 input variables
  /// of 31 bits.
  function primary_input_of_pubkey( uint256 pubkey )
    public pure returns ( string primary_input )
  {
    uint32[] temp;
    uint256 x = pubkey ;
    for( uint i = 0 ; i < 8 ; i ++ ){
      temp.push ( uint32( x & 0xffffff7f ) ) ;
      x = x >> 32 ;
    }

    primary_input = encode_little_endian(PRIMARY_INPUT_SIZE,4);
    for(uint i=0;i<PRIMARY_INPUT_SIZE;i++){
      primary_input.append(
                           uint256_to_bytes(
                                            uint256( temp[7-i]) << 224
                                            ));
    }
  }

}

