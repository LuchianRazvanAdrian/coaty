/*! Copyright (c) 2019 Siemens AG. Licensed under the MIT License. */

import { OpcuaConnector, OpcuaDataSource, OpcuaOptions } from "@coaty/connector.opcua";
import { Controller } from "@coaty/core";
import { NodeUtils } from "@coaty/core/runtime-node";

export interface Options extends OpcuaOptions {

}

/**
 * Template controller with lifecycle methods.
 */
export class FooController extends Controller {
    
    private _opcuaConnector: OpcuaConnector;

    onInit() {
        super.onInit();
        const opcuaOpts = this.options.opcuaOptions as Options;
        if (!opcuaOpts) {
            NodeUtils.logError("OpcuaIoSourceOptions must be specified for OpcuaIoSourceController.");
            return;
        }
        this._opcuaConnector = new OpcuaConnector(opcuaOpts);
        this._opcuaConnector
            .on("error", error => this.traceOpcuaError(error))
            .on("sessionCreated", () => {
                    const dataSource = opcuaOpts.dataSources;
                    if (!dataSource) {
                        return;
                    }
                    this.communicationManager.observeRaw("/temperature/+")
                    .subscribe(([topic, payload]) => {
                console.log("Publication topic:", topic);
                console.log("Payload data:", payload.toString());
                this.writeDataValue(dataSource, payload)
            });

        });

        NodeUtils.logInfo("FooController.onInit");
    }

    onCommunicationManagerStarting() {
        super.onCommunicationManagerStarting();
        this._opcuaConnector?.connect();
        this.communicationManager.observeRaw("/temperature/+")
            .subscribe(([topic, payload]) => {
        console.log("Publication topic:", topic);
        console.log("Payload data:", payload.toString());
    });

        NodeUtils.logInfo("FooController.onCommunicationManagerStarting");
    }

    onCommunicationManagerStopping() {
        super.onCommunicationManagerStopping();
        this._opcuaConnector?.disconnect();

        NodeUtils.logInfo("FooController.onCommunicationManagerStopping");
    }

    protected writeDataValue(dataSource: OpcuaDataSource, dataValue: any) {
        this._opcuaConnector.writeVariableValue(dataSource, dataValue)
            .catch(error => this._opcuaConnector.emit("error", error));
    }

    protected traceOpcuaError(error: any) {
        NodeUtils.logError(error, `[OPC UA Error]`);

    }
}