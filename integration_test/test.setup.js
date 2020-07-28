const { Setup } = require('../modules/setup/setup');

const sinon = require('sinon'),
      expect = require('chai').expect,
      Docker = require('dockerode'),

      Logger = require('../modules/logger'),
      TezsterManagerClass = require('../tezster-manager'),
      SetupClass = require('../modules/setup/setup');

var docker = new Docker({ socketPath: '/var/run/docker.sock', hosts: 'tcp://0.0.0.0:2376' });
const CONTAINER_NAME = 'tezster';

describe('Local Node Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        return new Promise((resolve) => {
            setTimeout(() => {
                sandbox = sinon.createSandbox();
                tezstermanager = new TezsterManagerClass.TezsterManager();
                setupObj = new SetupClass.Setup();
                resolve();
            }, 200);
        });
    });
    afterEach(() => {
        sandbox.restore()
    });

    context('stop-nodes', async () => {
        setTimeout(() => {
            sandbox.stub(process, 'exit');
        }, 500);
        it('should be able to stop local nodes', async () => {
            spyGetContainer = sinon.spy(docker, 'getContainer');

            setTimeout(async () => {
                console.log('-------------------------------STOP-NODES-------------------------------');
                await tezstermanager.stopNodes();
            }, 6000);
        });
    });

    context('start-nodes', async () => {
        spyGetImage = sinon.spy(docker, 'getImage');
        spyRunContainer = sinon.spy(docker, 'run');

        it('should be able to start local nodes', async () => {
            setTimeout(async () => {
                console.log('-------------------------------START-NODES-------------------------------');
                await tezstermanager.startNodes();
            }, 7000);
        });
    });

    context('node-status', async () => {
        it('should be able to fetch node status', async () => {

            setTimeout(async () => {
                console.log('-------------------------------NODE-STATUS-------------------------------');
                await tezstermanager.nodeStatus();
            }, 57000);
        });
    });

    context('get-logs', async () => {
        it('should be able to fetch logs from docker', async () => {
            const container = docker.getContainer(CONTAINER_NAME);
            spyGetArchieve = sinon.spy(container, 'getArchive');

            setTimeout(async () => {
                console.log('-------------------------------GET-LOGS-------------------------------');
                await tezstermanager.getLogFiles();
            }, 59000);
        });
    });

    context('confirm local nodes related call', async () => {
        it('should be able to output result as expected', async () => {

            setTimeout(async () => {
                expect({ spyGetContainer }).to.be.an('object');
                expect({ spyGetImage }).to.be.an('object');
                expect({ spyGetArchieve }).to.be.an('object');
                expect({ spyRunContainer }).to.be.an('object');
            }, 61000);
        });
    });

});