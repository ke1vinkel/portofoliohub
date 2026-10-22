import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "import/no-anonymous-default-export": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default config;
