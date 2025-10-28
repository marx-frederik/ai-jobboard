import { OrganizationList } from "@clerk/nextjs";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function OrganizationSelectPage(props: Props) {
  const { redirect } = await props.searchParams;
  const redirectUrl = redirect ?? "/employer";
  return (
    <OrganizationList
      hidePersonal
      hideSlug
      skipInvitationScreen
      afterCreateOrganizationUrl={redirectUrl}
      afterSelectOrganizationUrl={redirectUrl}
    />
  );
}
