
import React from 'react';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Header from '@/components/Header';

const Messages = () => {
  return (
    <Layout noContainer>
      <PageContainer>
        <Header title="Messages" showBack />
        
        <div className="py-4">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Messages</p>
            <p className="text-sm text-gray-400">
              Work in progress - Coming soon!
            </p>
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default Messages;
