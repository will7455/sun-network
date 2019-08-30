const {TIMEOUT, PRIVATE_KEY, ACCOUNTADDRESS,ADDRESS_HEX1,MAIN_GATEWAY_ADDRESS_HEX,ADDRESS_HEX2,CONTRACT_ADDRESS20,ADDRESS20_MAPPING,ADDRESS721_MAPPING,CONTRACT_ADDRESS721, FEE_LIMIT, MAIN_FULL_NODE_API, MAIN_SOLIDITY_NODE_API, MAIN_EVENT_API, SIDE_FULL_NODE_API, SIDE_SOLIDITY_NODE_API, SIDE_EVENT_API, MAIN_GATEWAY_ADDRESS, SIDE_GATEWAY_ADDRESS, ADDRESS_HEX, ADDRESS_BASE58, TOKEN_ID,  HASH20, HASH721, SIDE_CHAIN_ID} = require('./helpers/config');

const sunBuilder = require('./helpers/sunWebBuilder');
const SunWeb = sunBuilder.SunWeb;

const chai = require('chai');
const assert = chai.assert;
const assertThrow = require('./helpers/assertThrow');

describe('SunWeb Instance', function() {
    describe('#constructor', function() {
        it('should create an instance using an options object with private key', function() {
            const sunWeb = sunBuilder.createInstance();
            assert.instanceOf(sunWeb, SunWeb);
            assert.equal(sunWeb.mainchain.defaultPrivateKey, PRIVATE_KEY);
            assert.equal(sunWeb.sidechain.defaultPrivateKey, PRIVATE_KEY);
        });

        it('should create an instance using an options object without private key', function() {
            const mainOptions = {
                fullNode: MAIN_FULL_NODE_API,
                solidityNode: MAIN_SOLIDITY_NODE_API,
                eventServer: MAIN_EVENT_API
            };
            const sideOptions = {
                fullNode: SIDE_FULL_NODE_API,
                solidityNode: SIDE_SOLIDITY_NODE_API,
                eventServer: SIDE_EVENT_API
            };
            const sunWeb = new SunWeb(
                mainOptions,
                sideOptions,
                MAIN_GATEWAY_ADDRESS,
                SIDE_GATEWAY_ADDRESS,
                SIDE_CHAIN_ID
            );
            assert.equal(sunWeb.mainchain.defaultPrivateKey, false);
            assert.equal(sunWeb.sidechain.defaultPrivateKey, false);
        });

        it('should create an instance using an options object which only constains a fullhost without private key', function() {
            const mainOptions = {
                fullHost: MAIN_FULL_NODE_API
            };
            const sideOptions = {
                fullHost: SIDE_FULL_NODE_API
            };
            const sunWeb = new SunWeb(
                mainOptions,
                sideOptions,
                MAIN_GATEWAY_ADDRESS,
                SIDE_GATEWAY_ADDRESS,
                SIDE_CHAIN_ID
            );
            assert.instanceOf(sunWeb, SunWeb);
            assert.equal(sunWeb.mainchain.defaultPrivateKey, false);
            assert.equal(sunWeb.sidechain.defaultPrivateKey, false);
        });

        it('should create an instance using an options object which only constains a fullhost with private key', function() {
            const mainOptions = {
                fullHost: MAIN_FULL_NODE_API
            };
            const sideOptions = {
                fullHost: SIDE_FULL_NODE_API
            };
            const sunWeb = new SunWeb(
                mainOptions,
                sideOptions,
                MAIN_GATEWAY_ADDRESS,
                SIDE_GATEWAY_ADDRESS,
                SIDE_CHAIN_ID,
                PRIVATE_KEY
            );
            assert.instanceOf(sunWeb, SunWeb);
            assert.equal(sunWeb.mainchain.defaultPrivateKey, PRIVATE_KEY);
            assert.equal(sunWeb.sidechain.defaultPrivateKey, PRIVATE_KEY);
        });
    });

    describe('#depositTrc721', function () {
        const sunWeb = sunBuilder.createInstance();
        it('deposit trc721 from main chain to side chain', async function () {


            sunWeb.approveTrc721(1001, 1000000000, CONTRACT_ADDRESS721)
            await TIMEOUT(20000)
            const tokenid = 1001;
            const txID = await sunWeb.depositTrc721(tokenid, 0,FEE_LIMIT, CONTRACT_ADDRESS721);
            assert.equal(txID.length, 64);
            await TIMEOUT(60000)
            mdeposittrc721address1 = await sunWeb.mainchain.contract().at(CONTRACT_ADDRESS721);
            console.log(mdeposittrc721address1)

            mdeposittrc721address2 = await mdeposittrc721address1.ownerOf('1001').call()
            console.log("mdeposittrc721address2："+mdeposittrc721address2);


            sdeposittrc721address1 = await sunWeb.sidechain.transactionBuilder.triggerSmartContract(ADDRESS721_MAPPING, 'ownerOf(uint256)'
                , {feeLimit: 10000000}, [{type: 'uint256', value: '1001'}]);
            console.log({sdeposittrc721address1: sdeposittrc721address1})

            sdeposittrc721address2 = await sunWeb.sidechain.trx.sign(sdeposittrc721address1.transaction)
            console.log({sdeposittrc721address2: sdeposittrc721address2})

            sdeposittrc721address3 = await sunWeb.sidechain.trx.sendRawTransaction(sdeposittrc721address2)
            console.log({sdeposittrc721address3: sdeposittrc721address3})

            sdeposittrc721txid = sdeposittrc721address3.transaction.txID;
            console.log({sdeposittrc721txid: sdeposittrc721txid})
            await TIMEOUT(100000)

            sdeposittrc721info = await sunWeb.sidechain.trx.getTransactionInfo(sdeposittrc721txid);

            console.log({sdeposittrc721info: sdeposittrc721info})

            sdeposittrc721inforesult= sdeposittrc721info.contractResult;
            console.log({sdeposittrc721inforesult: sdeposittrc721inforesult})


            // const g= '000000000000000000000000431684a4f6bd07dacffac4bcc89c0af1c0016f19'
            // g1=g.substr(24,40)
            //
            // console.log({g1: g1})

            assert.equal(mdeposittrc721address2,MAIN_GATEWAY_ADDRESS_HEX)
            // alert(sdeposittrc721inforesult.substring(4))


            assert.equal(ADDRESS_HEX1,sdeposittrc721inforesult)



        });
    });
    describe('#withdrawTrc721', async function () {
        const sunWeb = sunBuilder.createInstance();
        it('withdraw trc721 from side chain to main chain', async function () {

            const tokenid = 1001;
            const txID = await sunWeb.withdrawTrc721(tokenid,0, FEE_LIMIT, ADDRESS721_MAPPING);
            assert.equal(txID.length, 64);
            await TIMEOUT(60000)

            mwithdrawtrc721address1 = await sunWeb.mainchain.contract().at(CONTRACT_ADDRESS721);

            mwithdrawtrc721address2 = await mwithdrawtrc721address1.ownerOf('1001').call()
            console.log("mdeposittrc721address2："+mwithdrawtrc721address2);


            swithdrawtrc721address1 = await sunWeb.sidechain.transactionBuilder.triggerSmartContract(ADDRESS721_MAPPING, 'ownerOf(uint256)'
                , {feeLimit: 10000000}, [{type: 'uint256', value: '1001'}]);

            swithdrawtrc721address2 = await sunWeb.sidechain.trx.sign(swithdrawtrc721address1.transaction)

            swithdrawtrc721address3 = await sunWeb.sidechain.trx.sendRawTransaction(swithdrawtrc721address2)
            swithdrawtrc721txid = swithdrawtrc721address3.transaction.txID;
            console.log({swithdrawtrc721txid: swithdrawtrc721txid})
            await TIMEOUT(20000)

            swithdrawtrc721info = await sunWeb.sidechain.trx.getTransactionInfo(swithdrawtrc721txid);

            console.log({swithdrawtrc721info: swithdrawtrc721info})

            swithdrawtrc721inforesult= swithdrawtrc721info.result;
            console.log({swithdrawtrc721inforesult: swithdrawtrc721inforesult})


            assert.equal(mwithdrawtrc721address2,ADDRESS_HEX2)
            assert.equal('FAILED',swithdrawtrc721inforesult)





    });
    });
});



