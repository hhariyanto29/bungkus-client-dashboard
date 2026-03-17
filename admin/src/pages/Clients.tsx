import React from 'react';

const Clients: React.FC = () => {
  const clients = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+62 812-3456-7890', orders: 12, spent: 'Rp 1,250,000' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+62 813-4567-8901', orders: 8, spent: 'Rp 850,000' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+62 814-5678-9012', orders: 15, spent: 'Rp 2,100,000' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+62 815-6789-0123', orders: 5, spent: 'Rp 450,000' },
    { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+62 816-7890-1234', orders: 20, spent: 'Rp 3,500,000' },
  ];

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all clients including their contact information and order history.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add client
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total Orders
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total Spent
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {client.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.phone}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.orders}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{client.spent}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">
                          View
                        </a>
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;