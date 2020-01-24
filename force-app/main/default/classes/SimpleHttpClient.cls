/*
 * Copyright (c) 2018, Salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

public class SimpleHttpClient {
  private HttpRequest req = new HttpRequest();
  private Http trans = new Http();

  public SimpleHttpClient() {
    this.header('Content-Type', 'application/json');
    this.header('Accept-Encoding', 'gzip');
    this.header('Cache-Control', 'no-cache');
    this.compressed(true);
  }

  public static SimpleHttpClient get(String endpoint) {
    return new SimpleHttpClient().request('GET', endpoint);
  }

  public static SimpleHttpClient post(String endpoint) {
    return new SimpleHttpClient().request('POST', endpoint);
  }
    
  public static SimpleHttpClient put(String endpoint) {
    return new SimpleHttpClient().request('PUT', endpoint);
  }
    
  public static SimpleHttpClient del(String endpoint) {
    return new SimpleHttpClient().request('DELETE', endpoint);
  }  

  public SimpleHttpClient header(String key, String value) {
    this.req.setHeader(key, value);
    return this;
  }

  public SimpleHttpClient auth(String value) {
    return this.header('Authorization', value);
  }

  public SimpleHttpClient body(String body) {
    this.req.setBody(body);
    return this;
  }

  public SimpleHttpClient compressed(Boolean compressed) {
    this.req.setCompressed(compressed);
    return this;
  }

  public SimpleHttpClient salesforce(String endpoint, String sessionId) {
    return this.header('Salesforce-Url', endpoint)
               .header('Salesforce-Session-Id', sessionId);
  }

  public HttpResponse send() {
    return this.trans.send(this.req);
  }

  private SimpleHttpClient request(String method, String endpoint) {
    this.req.setMethod(method);
    this.req.setEndpoint(endpoint);
    return this;
  }
}