"use client";

import { OrganizationList, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OnBoarding = () => {
  const { organization } = useOrganization();

  const router = useRouter();

  useEffect(() => {
    if (organization?.slug) {
      console.log(organization);
      router.push(`/organization/${organization.slug}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.slug,router]);

  return (
    <div className="flex justify-center items-center h-full">
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl="/organization/:slug"
      />
    </div>
  );
};

export default OnBoarding;
