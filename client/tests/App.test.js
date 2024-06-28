// App.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { createMemoryRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import '@testing-library/jest-dom/extend-expect';

// Mocking the server URL
process.env.REACT_APP_API_URL = 'http://localhost:5000';

// Mock fetch response
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

describe('App Component', () => {
  it('should render welcome page by default', () => {
    const router = createMemoryRouter([{ path: '/', element: <App /> }]);

    render(
      <>
        <ToastContainer />
        <RouterProvider router={router} />
      </>
    );

    expect(screen.getByText(/welcome to the app/i)).toBeInTheDocument();
  });

  it('should navigate to login page if not authenticated', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );

    const router = createMemoryRouter([{ path: '/home', element: <App /> }]);

    render(
      <>
        <ToastContainer />
        <RouterProvider router={router} />
      </>
    );

    await screen.findByText(/loading.../i);
    await screen.findByText(/you haven't logged in/i);
    await screen.findByText(/login/i);
  });

  it('should render home page if authenticated', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    const router = createMemoryRouter([{ path: '/home', element: <App /> }]);

    render(
      <>
        <ToastContainer />
        <RouterProvider router={router} />
      </>
    );

    await screen.findByText(/home page/i);
  });
});
