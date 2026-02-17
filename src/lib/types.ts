export type TokenResponse = { access_token: string; token_type: string };

export type SuperUserOut = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  telegram_id: string | null;
  is_root: boolean;
};

export type MatrixResponse = {
  program: string;
  cohort: number;
  groups: string[];
  subjects: { id: string; short_name: string; name: string }[];
  rows: {
    student: {
      id: string;
      student_id: string;
      first_name: string;
      last_name: string;
      group_name: string;
    };
    cells: Record<
      string,
      | { status: "na" }
      | { status: "dropped" }
      | { status: "enrolled"; absence: number; late: number }
    >;
  }[];
};
