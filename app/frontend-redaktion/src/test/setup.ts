import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom und Node-fetch haben verschiedene FormData-Klassen: Node würde das FormData aus jsdom als Text
// verschicken. Für Uploads (Ticket #25) merkt sich Request im Test deshalb das ursprüngliche FormData.
const NodeRequest = globalThis.Request;
class TestRequest extends NodeRequest {
  formBody?: FormData;
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const form = init?.body instanceof FormData ? init.body : undefined;
    super(input, form ? { ...init, body: 'multipart/form-data' } : init);
    this.formBody = form;
  }
}
globalThis.Request = TestRequest as typeof Request;
