
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';

const Notifications = () => {
  return (
    <Layout containerVariant="narrow">
      <Header title="Notifications" showBack />
      
      <div className="py-4">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Notifications</p>
          <p className="text-sm text-gray-400">
            Work in progress - Coming soon!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
