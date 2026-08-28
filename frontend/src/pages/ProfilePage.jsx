import React, { useState } from 'react'
import Layout from '../components/Layout/Layout'
import styles from "../styles/styles";
import ProfileSideBar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";

const ProfilePage = () => {
    const [active, setActive] = useState(1);
    return (
        <Layout>
            <div className={`${styles.section} flex gap-4 py-10`}>
                <div className="w-[56px] 800px:w-[300px] shrink-0 800px:sticky 800px:top-[140px] 800px:self-start">
                    <ProfileSideBar active={active} setActive={setActive} />
                </div>
                <div className="flex-1 min-w-0">
                    <ProfileContent active={active} />
                </div>
            </div>
        </Layout>
    )
}

export default ProfilePage
