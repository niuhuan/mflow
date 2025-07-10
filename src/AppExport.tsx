import { useEffect, useState } from "react";
import { get_account_uid } from "./fromTauri";


export function AppExport({ backToOpenSaveProject }: { backToOpenSaveProject: () => void }) {

    const [uid, setUid] = useState<string>('');

    useEffect(() => {
        var a = async () => {
            const uid = await get_account_uid();
            setUid(uid.toString());
        };
        a();
    }, []);

    return <div>
        <div>账号UID: {uid}</div>
        <button onClick={backToOpenSaveProject}>返回</button>
    </div>;
}
