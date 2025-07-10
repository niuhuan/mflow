import { open, save } from '@tauri-apps/plugin-dialog';

function OpenSaveProject({ initFromPath }: { initFromPath: (path: string) => void }) {
    return <div>
        <button onClick={async () => {
            const path = await open({
                filters: [
                    {
                        name: 'Blockly XML',
                        extensions: ['m7f']
                    }
                ]
            })
            if (path) {
                initFromPath(path);
            }
        }}>Open</button>
        <button onClick={async () => {
            const path = await save({
                filters: [
                    {
                        name: 'Blockly XML',
                        extensions: ['m7f']
                    }
                ]
            })
            if (path) {
                initFromPath(path);
            }
        }}>Save</button>
    </div>;
}

export default OpenSaveProject;