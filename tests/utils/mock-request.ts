export type MockRequest = {
  url: string
  json?: () => Promise<any>
}

export function makeGet(url: string): MockRequest {
  return { url }
}

export function makePost(url: string, body: any): MockRequest {
  return {
    url,
    json: async () => body,
  }
}
