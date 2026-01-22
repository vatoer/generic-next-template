export interface RouteItem {
  name: string;
  title: string;
  href: string;
  iconName: string; // for iconify
  order?: number;
  counter?: number;
  permissions?: string[]; // required permissions to display menu item
  displayAsMenu?: boolean; // whether to display as menu item (default: true)
  cascadePermissions?: boolean; // cascade permissions to sub routes (default: false)
  resources?: string[]; // resources required for this route
  subs?: RouteItem[]; // sub routes
}

export type LayoutUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type UserPermissionContext = {
  permissions: Array<{ resource: string; action: string }>;
  roles: Array<{ id: string; name: string }>;
};
