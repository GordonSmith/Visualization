import { IConnection, IOptions } from "../../../../connection";
import { Service } from "../../../../espConnection";

export namespace WsCodesign {

    export type int = number;

    export enum SigningMethodType {
        gpg = "gpg"
    }

    export interface ListUserIDsRequest {

    }

    export interface Exception {
        Code: string;
        Audience: string;
        Source: string;
        Message: string;
    }

    export interface Exceptions {
        Source: string;
        Exception: Exception[];
    }

    export interface UserIDs {
        Item: string[];
    }

    export interface ListUserIDsResponse {
        Exceptions: {
            Source: string;
            Exception: Exception[];
        };
        UserIDs: {
            Item: string[];
        };
    }

    export interface ws_codesignPingRequest {

    }

    export interface ws_codesignPingResponse {

    }

    export interface SignRequest {
        SigningMethod?: SigningMethodType;
        UserID?: string;
        KeyPass?: string;
        Text?: string;
    }

    export interface SignResponse {
        Exceptions: Exceptions;
        RetCode: int;
        ErrMsg: string;
        SignedText: string;
    }

    export interface VerifyRequest {
        Text?: string;
    }

    export interface VerifyResponse {
        Exceptions: Exceptions;
        RetCode: int;
        ErrMsg: string;
        IsVerified: boolean;
        SignedBy: string;
    }

}

export class CodesignServiceBase extends Service {

    constructor(optsConnection: IOptions | IConnection) {
        super(optsConnection, "ws_codesign", "1.1");
    }

    ListUserIDs(request: WsCodesign.ListUserIDsRequest): Promise<WsCodesign.ListUserIDsResponse> {
        return this._connection.send("ListUserIDs", request, "json", false, undefined, "ListUserIDsResponse");
    }

    Ping(request: WsCodesign.ws_codesignPingRequest): Promise<WsCodesign.ws_codesignPingResponse> {
        return this._connection.send("Ping", request, "json", false, undefined, "ws_codesignPingResponse");
    }

    Sign(request: WsCodesign.SignRequest): Promise<WsCodesign.SignResponse> {
        return this._connection.send("Sign", request, "json", false, undefined, "SignResponse");
    }

    Verify(request: WsCodesign.VerifyRequest): Promise<WsCodesign.VerifyResponse> {
        return this._connection.send("Verify", request, "json", false, undefined, "VerifyResponse");
    }

}
