export default {"abi":{"ABI version":2,"version":"2.1","header":["time","expire"],"functions":[{"name":"constructor","inputs":[{"name":"addrOwner","type":"address"},{"name":"codeIndex","type":"cell"},{"name":"metadata","type":"bytes"}],"outputs":[]},{"name":"transferOwnership","inputs":[{"name":"addrTo","type":"address"}],"outputs":[]},{"name":"getInfo","inputs":[],"outputs":[{"name":"addrRoot","type":"address"},{"name":"addrOwner","type":"address"},{"name":"addrData","type":"address"},{"name":"nameRoot","type":"bytes"},{"name":"metadata","type":"bytes"}]},{"name":"getOwner","inputs":[],"outputs":[{"name":"addrOwner","type":"address"}]},{"name":"resolveCodeHashIndex","inputs":[{"name":"addrRoot","type":"address"},{"name":"addrOwner","type":"address"}],"outputs":[{"name":"codeHashIndex","type":"uint256"}]},{"name":"resolveIndex","inputs":[{"name":"addrRoot","type":"address"},{"name":"addrData","type":"address"},{"name":"addrOwner","type":"address"}],"outputs":[{"name":"addrIndex","type":"address"}]}],"data":[{"key":1,"name":"_id","type":"uint256"},{"key":2,"name":"_name","type":"bytes"}],"events":[],"fields":[{"name":"_pubkey","type":"uint256"},{"name":"_timestamp","type":"uint64"},{"name":"_constructorFlag","type":"bool"},{"name":"_codeIndex","type":"cell"},{"name":"_addrRoot","type":"address"},{"name":"_addrOwner","type":"address"},{"name":"_addrAuthor","type":"address"},{"name":"_id","type":"uint256"},{"name":"_name","type":"bytes"},{"name":"_metadata","type":"bytes"}]},"image":"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"}