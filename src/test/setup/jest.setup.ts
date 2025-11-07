import '@testing-library/jest-dom/extend-expect';

// MSW sunucusunu testlerde devreye almak için global setup.
import { server } from '../server/mswServer';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
