export type Lounge = {
  id: number;
  continent: string;
  country: string;
  city: string;
  airport: string;
  code: string;
  terminal: string;
  name: string;
  departureType: string;
  securityType: string;
  directions: string;
  searchText: string;
};

export type FilterKey =
  | "continent"
  | "country"
  | "city"
  | "code"
  | "departureType"
  | "securityType";
