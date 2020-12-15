/*! Copyright (c) 2019 Siemens AG. Licensed under the MIT License. */

import { OpcuaOptions } from "@coaty/connector.opcua";
import { Components, Configuration, Container } from "@coaty/core";
import { NodeUtils } from "@coaty/core/runtime-node";

import { agentInfo } from "./agent.info";
import { FooController } from "./controller/foo-controller";

NodeUtils.logInfo(`BROKER_URL=${process.env.BROKER_URL}`);

if (!process.env.BROKER_URL) {
    NodeUtils.logError(new Error("Missing Broker URL"), "Environment variable BROKER_URL not specified.");
    process.exit(1);
}

const producerNamespaceUri = "urn:NodeOPCUA-Server-default";

const opcuaOptions: OpcuaOptions = {
    endpointUrl: "opc.tcp://localhost:4334/UA/Producer",
    connectionOptions: {
        // To enable endpoint matching against localhost, set this option to
        // false.
        endpoint_must_exist: false,

        // Extend session lifetime for unsecured connection to maximum UInt32 to
        // prevent premature session expiration after 40secs.
        defaultSecureTokenLifetime: 4294967295,

        // Only needed for OPC UA clients that do not monitor OPC UA items (see
        // OpcuaIoActorController).
        keepSessionAlive: true,
    },
    dataSources: {
        // Variable Tag1 of Object Node device PLC1.
        "PLC1.Tag1": {
            nodeIdentifier: { namespaceUri: producerNamespaceUri, identifierWithType: "i=2001" },
            shouldMonitorItem: true,
            monitoringParameters: {
                samplingInterval: 1000,
            },
        },
    },
};

const components: Components = {
    controllers: {
        FooController,
    },
};

const configuration: Configuration = {
    common: {
        agentInfo,
        agentIdentity: { name: "template agent" },
    },
    communication: {
        brokerUrl: process.env.BROKER_URL,
        // Define a unique communication namepace for your application.
        namespace: "com.template",
        shouldAutoStart: true,
    },
    controllers: {
        FooController: {
            // Options for FooController
        },
    },
};

// Bootstrap a Coaty container with the specified components and autostart its
// communication manager.
const container = Container.resolve(components, configuration);

NodeUtils.logCommunicationState(container);
