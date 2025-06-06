export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  UserProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  List: undefined;
  Search: undefined;
  Notifications: undefined;
  Form: undefined;
  Payment: undefined;
  TransactionDetails: { transactionId: string };
  Error: { message?: string };
  Success: undefined;
  OrderHistory: undefined;
  HelpSupport: undefined;
  Main: undefined;
  Detail:{
    id: number;
    title:string; 
    description: string
  }
  
};
export type Newstype = { 
  id: number;
  title:string;
  description: string;
};
