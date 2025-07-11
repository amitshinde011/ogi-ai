
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';

const Messages = () => {
  return (
    <Layout>
      <Header title="Messages" showBack />
      
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Messages</p>
          <p className="text-sm text-gray-400">
            Work in progress - Coming soon!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
