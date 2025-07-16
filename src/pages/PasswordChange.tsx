
import React from 'react';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Header from '@/components/Header';
import PasswordChangeForm from '@/components/settings/PasswordChangeForm';

const PasswordChange = () => {
  return (
    <Layout noContainer>
      <div className="space-y-8 py-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <PageContainer>
          <Header title="Change Password" showBack={true} />
          <PasswordChangeForm />
        </PageContainer>
      </div>
    </Layout>
  );
};

export default PasswordChange;
