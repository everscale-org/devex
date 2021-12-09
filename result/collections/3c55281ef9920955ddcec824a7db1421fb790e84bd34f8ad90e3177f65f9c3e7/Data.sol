pragma ton-solidity >=0.43.0;

pragma AbiHeader expire;
pragma AbiHeader time;

import 'ADataCore.sol';
import './interfaces/IData.sol';
import './libraries/Enums.sol';

contract Data is IData, DataCore {

    string _nftType;

    uint heroPower;
	string arm;
	/*%PARAM_DEFENITION%*/

    constructor(
        address addrOwner,
        TvmCell codeIndex,
        bytes _name,
        bytes _url,
        uint8 _editionNumber,
        uint8 _editionAmount,
        address[] _managersList,
        uint8 _royalty,

        string nftType, 
		uint _heroPower, 
		string _arm/*%PARAM_CONSTRUCTOR%*/
    )
        public
    {
        optional(TvmCell) optSalt = tvm.codeSalt(tvm.code());
        require(optSalt.hasValue(), 101);
        (address addrRoot) = optSalt.get().toSlice().decode(address);
        require(msg.sender == addrRoot);
        tvm.accept();

        _addrRoot = addrRoot;
        _addrOwner = addrOwner;
        _addrAuthor = addrOwner;
        _codeIndex = codeIndex;
        dataName = _name;
        dataUrl = _url;
        editionNumber = _editionNumber;
        editionAmount = _editionAmount;
        managersListArr = _managersList;
        royalty = _royalty;
        _nftType = nftType;

        for (uint8 i; i < _managersList.length; i++) {
            managersList[_managersList[i]] = i;
        }
        heroPower = _heroPower;
		arm = _arm;
		/*%PARAM_SET%*/

        deployIndex(addrOwner);
    }

    function getInfo() public view override returns (
        address addrRoot,
        address addrOwner,
        address addrAuthor,
        address addrData,
        uint256 id,
        bytes name,
        bytes url,
        uint8 number,
        uint8 amount,
        string nftType, 
		uint _heroPower, 
		string _arm/*%PARAM_DATA_INFO%*/
    ) {
        addrRoot = _addrRoot;
        addrOwner = _addrOwner;
        addrAuthor = _addrAuthor;
        addrData = address(this);
        id = _id;
        name = dataName;
        url = dataUrl;
        number = editionNumber;
        amount = editionAmount;
        nftType = _nftType;
        _heroPower = heroPower;
		_arm = arm;
		/*PARAM_SET_DATA_INFO*/
    }

    function getInfoResponsible() external view override responsible returns (
        address addrRoot,
        address addrOwner,
        address addrAuthor,
        address addrData,
        uint256 id,
        bytes name,
        bytes url,
        uint8 number,
        uint8 amount
    ) {
        return { value: 0 ton, flag: 64 } (
        _addrRoot,
        _addrOwner,
        _addrAuthor,
        address(this),
        _id,
        dataName,
        dataUrl,
        editionNumber,
        editionAmount);
    }
}
