
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import PasswordChangeForm from '@/components/settings/PasswordChangeForm';

const PasswordChange = () => {
  return (
    <Layout>
      <Header title="Change Password" />
      
      <div className="p-6 space-y-8 max-w-lg mx-auto bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <PasswordChangeForm />
      </div>
    </Layout>
  );
};

export default PasswordChange;
