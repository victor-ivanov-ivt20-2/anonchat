export interface UserModel {
  privateRoom?: string;
  publicRooms: string[];
  searching?: SeekerModel;
}

export interface SeekerModel {
  himself: HimselfProperty;
  opponent: OpponentProperty;
}

interface SeekerProperty {
  sex: "Male" | "Female";
}

type OpponentProperty = SeekerProperty & {
  age: {
    from: number;
    to: number;
  };
};

type HimselfProperty = SeekerProperty & {
  age: number;
};
