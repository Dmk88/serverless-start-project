import { cacheControl, contentLength, contentType, expires } from '@constants/headers';
import { isJsonString } from '@helpers/json/isJsonString';
import { logger } from '@logger/logger';
import { IResponce } from '@shared/http/response/responceInterface';

/*tslint:disable: no-magic-numbers*/

export class Response {
  private statusCode: number;
  private headers: object;
  private body: string;

  public constructor() {
    this.initializeByDefault();
  }

  public setStatusCode(statusCode: number): Response {
    this.statusCode = statusCode;
    return this;
  }

  public addHeaders(headers: object): Response {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  public setBody(body: object | string): Response {
    this.body = (typeof body === 'object') ? JSON.stringify(body) : body;
    return this;
  }

  public responseCallback(): IResponce {
    this.logResponse();
    return {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body
    };
  }

  private initializeByDefault(): void {
    /*tslint:disable: no-magic-numbers*/
    this.statusCode = 200;
    this.headers = {
      ...cacheControl.noCacheNoStoreRevalidateAgeZero,
      ...expires.zero
    };
    this.body = '';
  }

  private logResponse(): void {
    try {
      logger.info(JSON.stringify({
        statusCode: this.statusCode,
        headers: this.headers,
        body: (isJsonString(this.body)) ? JSON.parse(this.body) : this.body
      }));
    } catch (e) {
      logger.error('Error on logging response', e);
    }
  }
}

export function responseOk(data: object): IResponce {
  return new Response()
    .setBody(data)
    .addHeaders(contentType.applicationJSON)
    .responseCallback();
}

export function responseCreated(data: object): IResponce {
  return new Response()
    .setBody(data)
    .setStatusCode(201)
    .addHeaders(contentType.applicationJSON)
    .responseCallback();
}

export function responseAccepted(): IResponce {
  return new Response()
    .setStatusCode(202)
    .addHeaders(contentType.applicationJSON)
    .responseCallback();
}

export function responseNoContent(): IResponce {
  return new Response()
    .setStatusCode(204)
    .addHeaders(contentLength.zero)
    .responseCallback();
}

export function responseRedirect(url: string): IResponce {
  return new Response()
    .setStatusCode(301)
    .addHeaders({ Location: url, ...contentLength.zero })
    .responseCallback();
}

export function responseAlreadyReported(error?: Error): IResponce {
  if (error) {
    logger.error(error.message, error);
  }

  return new Response()
    .setStatusCode(208)
    .addHeaders(contentLength.zero)
    .responseCallback();
}

export function responseHtml(html: string): IResponce {
  return new Response()
    .addHeaders(contentType.textHTML)
    .setBody(html)
    .responseCallback();
}

export function responseText(text: string): IResponce {
  return new Response()
    .addHeaders(contentType.textPlain)
    .setBody(text)
    .responseCallback();
}
