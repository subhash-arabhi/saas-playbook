// Source: arhamkhnz/next-shadcn-admin-dashboard@e832f5b src/app/(main)/mail/_components/use-mail.ts (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { create } from "zustand";

import { type Mail, mails } from "./data";

type Config = {
  selected: Mail["id"] | null;
};

type MailStore = {
  mail: Config;
  setMail: (mail: Config) => void;
};

const useMailStore = create<MailStore>((set) => ({
  mail: {
    selected: mails[0].id,
  },
  setMail: (mail) => set({ mail }),
}));

export function useMail() {
  const mail = useMailStore((state) => state.mail);
  const setMail = useMailStore((state) => state.setMail);

  return [mail, setMail] as const;
}
