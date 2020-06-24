const sinon = require('sinon'),
      path = require('path'),
      program = require('commander'),
      Docker = require('dockerode'),
      os = require('os'),

      Logger = require('../modules/logger'),
      { Helper } = require('../modules/helper'),
      { RpcRequest } = require('../modules/rpc-util'),
      SetupClass = require('../modules/setup/setup'),

      LOCAL_NODE_URL = 'http://localhost:18731';

var docker = new Docker({ socketPath: '/var/run/docker.sock', hosts: 'tcp://0.0.0.0:2376' });

describe('Setup Operations', async () => {
    let sandbox = null;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        setup = new SetupClass.Setup();
    });
    afterEach(() => {
        sandbox.restore();
    });

    context('node-status', async () => {
        it('should be able to fetch node status for running nodes', async () => {
            stubPullNodes = sandbox.stub(RpcRequest, 'checkNodeStatus')
                                    .withArgs(LOCAL_NODE_URL)
                                    .returns({
                                        protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb',
                                        next_protocol: 'PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb'
                                      }
                                      );
            stubInfo = sandbox.stub(Logger, 'info');
            
            await setup.nodeStatus();
            sinon.assert.calledOnce(stubPullNodes);
            sinon.assert.calledOnce(stubInfo);
        });

        it('should be able to fetch node status for stopped nodes', async () => {
            stubPullNodes = sandbox.stub(RpcRequest, 'checkNodeStatus')
                                    .withArgs(LOCAL_NODE_URL)
                                    .returns({
                                        protocol: 'PsGENESISazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQdl',
                                        next_protocol: 'PsGENESISazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb'
                                      }
                                      );
            stubError = sandbox.stub(Logger, 'error');
            
            await setup.nodeStatus();
            sinon.assert.calledOnce(stubPullNodes);
            sinon.assert.calledOnce(stubError);
        });
    });

})