/* eslint-disable no-unused-vars */
export enum UserRoleEnum {
  APP_SALES = 'APP_SALES',
  APP_FIELDWORKER = 'APP_FIELDWORKER',
  APP_ADMIN = 'APP_ADMIN',
  APP_SPECIALIST = 'APP_SPECIALIST',
  APP_USER = 'APP_USER',
}

export type UserRoleType = keyof typeof UserRoleEnum;

export type UserType = {
  firstName?: string;
  lastName?: string;
  email: string;
  lastSignIn?: string;
  roles: {
    items: Array<{
      name: UserRoleType;
    }>;
  };
};

export type AddressType = EntityBaseType & {
  country: string;
  state: string;
  streetAddress: string;
  city: string;
  apartamentNumber: string;
  zipCode: string;
};

export type FileType = {
  id: string;
  downloadUrl: string;
  shareUrl: string;
  fileId: string;
  filename: string;
};

export type EntityBaseType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: UserType;
};
