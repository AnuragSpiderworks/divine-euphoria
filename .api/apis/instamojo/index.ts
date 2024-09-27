import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'instamojo/unknown (api/6.1.2)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Generate Access token (Application Based Authentication)
   *
   * @throws FetchError<400, types.GenerateAccessTokenApplicationBasedAuthenticationResponse400> 400
   * @throws FetchError<401, types.GenerateAccessTokenApplicationBasedAuthenticationResponse401> 401
   */
  generateAccessTokenApplicationBasedAuthentication(body: types.GenerateAccessTokenApplicationBasedAuthenticationFormDataParam): Promise<FetchResponse<200, types.GenerateAccessTokenApplicationBasedAuthenticationResponse200>> {
    return this.core.fetch('/oauth2/token/', 'post', body);
  }

  /**
   * This will refund a payment made on Instamojo. You need to use a token that is obtained
   * using the Application Based Authentication.
   *
   * @summary Create a Refund
   * @throws FetchError<401, types.CreateARefund1Response401> 401
   */
  createARefund1(body: types.CreateARefund1FormDataParam, metadata: types.CreateARefund1MetadataParam): Promise<FetchResponse<200, types.CreateARefund1Response200>> {
    return this.core.fetch('/v2/payments/{payment_id}/refund/', 'post', body, metadata);
  }

  /**
   * This will update the bank account details of an account on Instamojo. You need to use a
   * token that is obtained using the User Based Authentication.
   *
   * @summary Update bank details of a user
   * @throws FetchError<400, types.UpdateBankDetailsOfAUserResponse400> 400
   * @throws FetchError<401, types.UpdateBankDetailsOfAUserResponse401> 401
   * @throws FetchError<404, types.UpdateBankDetailsOfAUserResponse404> 404
   */
  updateBankDetailsOfAUser(body: types.UpdateBankDetailsOfAUserFormDataParam, metadata: types.UpdateBankDetailsOfAUserMetadataParam): Promise<FetchResponse<200, types.UpdateBankDetailsOfAUserResponse200>> {
    return this.core.fetch('/v2/users/{id}/inrbankaccount/', 'put', body, metadata);
  }

  /**
   * This will fetch the details of a payment request on Instamojo. You need to use a token
   * that is obtained using the Application Based Authentication.
   *
   * @summary Get a Payment Request
   * @throws FetchError<401, types.GetAPaymentRequest1Response401> 401
   */
  getAPaymentRequest1(metadata: types.GetAPaymentRequest1MetadataParam): Promise<FetchResponse<200, types.GetAPaymentRequest1Response200>> {
    return this.core.fetch('/v2/payment_requests/{id}/', 'get', metadata);
  }

  /**
   * This will create an account on Instamojo. You need to use a token that is obtained using
   * the Application Based Authentication.
   *
   * @summary Signup
   * @throws FetchError<400, types.SignupResponse400> 400
   * @throws FetchError<401, types.SignupResponse401> 401
   */
  signup(body: types.SignupFormDataParam): Promise<FetchResponse<200, types.SignupResponse200>> {
    return this.core.fetch('/v2/users/', 'post', body);
  }

  /**
   * This will create a payment request on Instamojo. You need to use a token that is
   * obtained using the Application Based Authentication.
   *
   * @summary Create a Payment Request
   * @throws FetchError<400, types.CreateAPaymentRequest1Response400> 400
   * @throws FetchError<401, types.CreateAPaymentRequest1Response401> 401
   */
  createAPaymentRequest1(body: types.CreateAPaymentRequest1FormDataParam, metadata?: types.CreateAPaymentRequest1MetadataParam): Promise<FetchResponse<200, types.CreateAPaymentRequest1Response200>> {
    return this.core.fetch('/v2/payment_requests/', 'post', body, metadata);
  }

  /**
   * This will updated the details of an account on Instamojo. You need to use a token that
   * is obtained using the User Based Authentication.
   *
   * @summary Update details of a user
   * @throws FetchError<400, types.UpdateDetailsOfAUserResponse400> 400
   * @throws FetchError<401, types.UpdateDetailsOfAUserResponse401> 401
   * @throws FetchError<404, types.UpdateDetailsOfAUserResponse404> 404
   */
  updateDetailsOfAUser(body: types.UpdateDetailsOfAUserFormDataParam, metadata: types.UpdateDetailsOfAUserMetadataParam): Promise<FetchResponse<200, types.UpdateDetailsOfAUserResponse200>>;
  updateDetailsOfAUser(metadata: types.UpdateDetailsOfAUserMetadataParam): Promise<FetchResponse<200, types.UpdateDetailsOfAUserResponse200>>;
  updateDetailsOfAUser(body?: types.UpdateDetailsOfAUserFormDataParam | types.UpdateDetailsOfAUserMetadataParam, metadata?: types.UpdateDetailsOfAUserMetadataParam): Promise<FetchResponse<200, types.UpdateDetailsOfAUserResponse200>> {
    return this.core.fetch('/v2/users/{id}/', 'patch', body, metadata);
  }

  /**
   * This will fulfil a payment made on Instamojo. You need to use a token that is obtained
   * using the Application Based Authentication.
   *
   * @summary Fulfil a Payment
   * @throws FetchError<401, types.FulfilAPaymentResponse401> 401
   */
  fulfilAPayment(metadata: types.FulfilAPaymentMetadataParam): Promise<FetchResponse<200, types.FulfilAPaymentResponse200>> {
    return this.core.fetch('/v2/payments/{payment_id}/fulfil/', 'post', metadata);
  }

  /**
   * This will create a Order on Instamojo. You need to use a token that is obtained using
   * the Application Based Authentication.
   *
   * @summary Create an Order using Payment Request ID (For SDK only)
   * @throws FetchError<400, types.CreateAnOrderUsingPaymentRequestId1Response400> 400
   * @throws FetchError<401, types.CreateAnOrderUsingPaymentRequestId1Response401> 401
   */
  createAnOrderUsingPaymentRequestId1(body?: types.CreateAnOrderUsingPaymentRequestId1FormDataParam, metadata?: types.CreateAnOrderUsingPaymentRequestId1MetadataParam): Promise<FetchResponse<200, types.CreateAnOrderUsingPaymentRequestId1Response200>> {
    return this.core.fetch('/v2/gateway/orders/payment-request/', 'post', body, metadata);
  }

  /**
   * This will disable the payment request on Instamojo. You need to use a token that is
   * obtained using the User Based Authentication.
   *
   * @summary Disable a Request
   */
  disableARequest(metadata: types.DisableARequestMetadataParam): Promise<FetchResponse<200, types.DisableARequestResponse200>> {
    return this.core.fetch('/v2/payment_requests/{id}/disable/', 'post', metadata);
  }

  /**
   * This will enable the payment request on Instamojo. You need to use a token that is
   * obtained using the User Based Authentication.
   *
   * @summary Enable a Request
   */
  enableARequest(metadata: types.EnableARequestMetadataParam): Promise<FetchResponse<200, types.EnableARequestResponse200>> {
    return this.core.fetch('/v2/payment_requests/{id}/enable/', 'post', metadata);
  }

  /**
   * This will fetch the details of a payment on Instamojo. You need to use a token that is
   * obtained using the Application Based Authentication.
   *
   * @summary Get Payment Details
   * @throws FetchError<401, types.GetPaymentDetails1Response401> 401
   */
  getPaymentDetails1(metadata: types.GetPaymentDetails1MetadataParam): Promise<FetchResponse<200, types.GetPaymentDetails1Response200>> {
    return this.core.fetch('/v2/payments/{id}/', 'get', metadata);
  }

  /**
   * Creating Virtual Accounts
   *
   * @throws FetchError<401, types.CreatingVirtualAccountsResponse401> 401
   */
  creatingVirtualAccounts(body?: types.CreatingVirtualAccountsFormDataParam): Promise<FetchResponse<201, types.CreatingVirtualAccountsResponse201>> {
    return this.core.fetch('/v2/virtual_accounts/', 'post', body);
  }

  /**
   * Returns first (latest) 50 virtual accounts
   *
   * @summary Listing Virtual Accounts
   * @throws FetchError<400, types.ListingVirtualAccountsResponse400> 400
   */
  listingVirtualAccounts(metadata?: types.ListingVirtualAccountsMetadataParam): Promise<FetchResponse<200, types.ListingVirtualAccountsResponse200>> {
    return this.core.fetch('/v2/virtual_accounts/', 'get', metadata);
  }

  /**
   * This will fetch the details of a refund made on a payment on Instamojo.
   *
   * @summary Get details of a refund
   * @throws FetchError<401, types.GetDetailsOfARefund1Response401> 401
   */
  getDetailsOfARefund1(metadata: types.GetDetailsOfARefund1MetadataParam): Promise<FetchResponse<200, types.GetDetailsOfARefund1Response200>> {
    return this.core.fetch('/v2/resolutioncenter/cases/{id}/', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { CreateAPaymentRequest1FormDataParam, CreateAPaymentRequest1MetadataParam, CreateAPaymentRequest1Response200, CreateAPaymentRequest1Response400, CreateAPaymentRequest1Response401, CreateARefund1FormDataParam, CreateARefund1MetadataParam, CreateARefund1Response200, CreateARefund1Response401, CreateAnOrderUsingPaymentRequestId1FormDataParam, CreateAnOrderUsingPaymentRequestId1MetadataParam, CreateAnOrderUsingPaymentRequestId1Response200, CreateAnOrderUsingPaymentRequestId1Response400, CreateAnOrderUsingPaymentRequestId1Response401, CreatingVirtualAccountsFormDataParam, CreatingVirtualAccountsResponse201, CreatingVirtualAccountsResponse401, DisableARequestMetadataParam, DisableARequestResponse200, EnableARequestMetadataParam, EnableARequestResponse200, FulfilAPaymentMetadataParam, FulfilAPaymentResponse200, FulfilAPaymentResponse401, GenerateAccessTokenApplicationBasedAuthenticationFormDataParam, GenerateAccessTokenApplicationBasedAuthenticationResponse200, GenerateAccessTokenApplicationBasedAuthenticationResponse400, GenerateAccessTokenApplicationBasedAuthenticationResponse401, GetAPaymentRequest1MetadataParam, GetAPaymentRequest1Response200, GetAPaymentRequest1Response401, GetDetailsOfARefund1MetadataParam, GetDetailsOfARefund1Response200, GetDetailsOfARefund1Response401, GetPaymentDetails1MetadataParam, GetPaymentDetails1Response200, GetPaymentDetails1Response401, ListingVirtualAccountsMetadataParam, ListingVirtualAccountsResponse200, ListingVirtualAccountsResponse400, SignupFormDataParam, SignupResponse200, SignupResponse400, SignupResponse401, UpdateBankDetailsOfAUserFormDataParam, UpdateBankDetailsOfAUserMetadataParam, UpdateBankDetailsOfAUserResponse200, UpdateBankDetailsOfAUserResponse400, UpdateBankDetailsOfAUserResponse401, UpdateBankDetailsOfAUserResponse404, UpdateDetailsOfAUserFormDataParam, UpdateDetailsOfAUserMetadataParam, UpdateDetailsOfAUserResponse200, UpdateDetailsOfAUserResponse400, UpdateDetailsOfAUserResponse401, UpdateDetailsOfAUserResponse404 } from './types';
