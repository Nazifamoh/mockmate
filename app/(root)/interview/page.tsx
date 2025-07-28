// generate custom interview questions based on user input

import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
    const user = await getCurrentUser();

    return (
        <>
            <h3>Interview Generation</h3>

            {/* voice ai agent collecting user input */}
            <Agent
                userName={user?.name!}
                userId={user?.id}
                profileImage={user?.profileURL}
                type="generate"
            />
        </>
    );
};

export default Page;