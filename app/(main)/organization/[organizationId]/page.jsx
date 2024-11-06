import { getOrganization } from "@/actions/organizations";
import { OrganizationSwitcher } from "@clerk/nextjs";
import ProjectList from "../components/project-list";
import OrgSwitcher from "@/components/org-switcher";

const Organization = async ({ params }) => {
  const { organizationId } = params;

  const currentOrganizationInfo = await getOrganization(organizationId);
  console.log(currentOrganizationInfo);

  return (
    <div className="container mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
        <h1 className="text-5xl font-bold gradient-title pb-2 pr-0">{currentOrganizationInfo?.name}&rsquo;s Projects</h1>
        {/* org switcher */}
        <OrgSwitcher/>
      </div>
      <div className="mb-4">
        <ProjectList/>
      </div>
    </div>
  );
};

export default Organization;
