import { describe, it, Mock, SpyInstance } from "vitest";
import { mockReq, mockRes } from "sinon-express-mock";

import { expressMiddlewareAdapter } from "@/infra/express/adapters";
import { Middleware } from "@/application/protocols";
import { HttpResponse } from "@/application/helpers";
import { NextFunction, Request, Response } from "express";
import { AccessDeniedError } from "@/application/errors";

class MiddlewareStub implements Middleware {
  async handle(httpRequest: any): Promise<HttpResponse<any>> {
    return Promise.resolve({
      statusCode: 200,
      data: { userId: 1 },
    });
  }
}

const makeSut = () => {
  const middlewareStub = new MiddlewareStub();
  const sut = expressMiddlewareAdapter(middlewareStub);

  return { sut, middlewareStub };
};

describe("ExpressMiddlewareAdapter", () => {
  let req: Request;
  let res: Response;
  let nextFunction: Mock;
  let statusSpy: SpyInstance;
  let jsonSpy: SpyInstance;

  beforeAll(() => {
    req = mockReq();
    res = mockRes();
  });

  beforeEach(() => {
    statusSpy = vi.spyOn(res, "status");
    jsonSpy = vi.spyOn(res, "json");
    nextFunction = vi.fn();
  });

  it("should call handle with correct input", async () => {
    const { sut, middlewareStub } = makeSut();
    const handleSpy = vi.spyOn(middlewareStub, "handle");

    await sut(req, res, nextFunction);

    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(handleSpy).toHaveBeenCalledWith(req.headers);
  });

  it("should respond with statusCode 401 and AccessDeniedError", async () => {
    const { sut, middlewareStub } = makeSut();
    vi.spyOn(middlewareStub, "handle").mockResolvedValueOnce({
      statusCode: 401,
      data: new AccessDeniedError(),
    });


    await sut(req, res, nextFunction);

    expect(statusSpy).toHaveBeenCalledTimes(1);
    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(jsonSpy).toHaveBeenCalledWith({
      error: new AccessDeniedError().message,
    });
  });

  it("should respond with statusCode 500 and Error", async () => {
    const { sut, middlewareStub } = makeSut();
    vi.spyOn(middlewareStub, "handle").mockResolvedValueOnce({
      statusCode: 500,
      data: new Error("any_error"),
    });

    await sut(req, res, nextFunction);

    expect(statusSpy).toHaveBeenCalledTimes(1);
    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(jsonSpy).toHaveBeenCalledWith({ error: "any_error" });
  });

  it("should call nextFunction", async () => {
    const { sut } = makeSut();

    await sut(req, res, nextFunction);

    expect(statusSpy).toHaveBeenCalledTimes(0);
    expect(jsonSpy).toHaveBeenCalledTimes(0);
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it("should add valid data on req.locals", async () => {
    const { sut } = makeSut();

    await sut(req, res, nextFunction);

    expect(req.locals).toEqual({ userId: 1 })
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
