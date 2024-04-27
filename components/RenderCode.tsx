'use client'
import { useState } from "react";
import { Input } from "./ui/input";
import axios from "axios";
import { Button } from "./ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "./ui/separator";
import { ClipboardCheck, ClipboardIcon } from "lucide-react";
export default function RenderCode() {
    const [url, setUrl] = useState('');
    const [ogTags,setOgTags] = useState<Array<[string, string]>>([]); 
    const [codeStringArray, setCodeStringArray] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);

    const validateURL = (url: string) => {
        const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
                                    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                                    '(\\:\\d+)?'+ // port
                                    '(\\/[-a-z\\d%_.~+]*)*'+ // path
                                    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                                    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return urlPattern.test(url);
    } 
    const fetchOgTags = async () => {
        try {
            if(!validateURL(url)){
                setErrorMsg('Invalid URL');
                return;
            }
            const response = await axios.get(`/api/getogtags?url=${url}`);
            setOgTags(Object.entries(response?.data?.ogTags));
            const codeArray = Object.entries(response?.data?.ogTags).map(([key, value]) => {
                if (key.startsWith('og:')) {
                    return `<meta property="${key}" content="${value}">`;
                } else if (key.startsWith('twitter:')) {
                    return `<meta name="${key}" content="${value}">`;
                }
            }).filter((item)=> item !== undefined);
            
            setCodeStringArray(codeArray || []);

        } catch (error) {
            if(error instanceof Error){
                setErrorMsg(error.message);
            }
            setErrorMsg('An error occurred');
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(codeStringArray.join('\n')).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        });
    }

    return (
        <div className="max-w-[100%] space-y-5">
            <ResizablePanelGroup direction="horizontal" className="flex items-stretch align-middle justify-center p-5 border morphic gap-2 rounded-md" style={{visibility : `${ogTags.length > 0 ? 'visible' : 'collapse'}`}}>
                <ResizablePanel defaultSize={65} className="p-5 rounded-md dark:border bg-neutral-900 flex flex-col justify-center align-middle text-sm">
                    <div className="flex justify-end">
                        <Button variant={'ghost'} onClick={copyToClipboard} className="opacity-80"> {copied ? <ClipboardCheck size={15}/> : <ClipboardIcon size={15}/>} </Button>
                    </div>
                    
                    <code>
                        {codeStringArray.map((line,i)=><pre key={`${i}th_line`} className="whitespace-pre-line text-blue-200">{line}</pre>)}
                    </code>                        
                </ResizablePanel>
                <ResizableHandle withHandle />
                {/* <ResizablePanel defaultSize={60}> */}
                <ResizablePanel defaultSize={35}  className="grid grid-cols-1 gap-2">
                    <div>
                        {
                            ogTags.length > 0 && ogTags.map(([key, value]) => (
                                key === 'og:image' ? <img src={value} alt={key} key={key} className="rounded-md border"/> : null                        
                            ))
                        }
                    </div>
                    <Separator/>
                    <div>
                        {
                            ogTags.length > 0 && ogTags.map(([key, value]) => (
                                key === 'twitter:image' ? <img src={value} alt={key} key={key} className="rounded-md border" /> : null                        
                            ))
                        }
                    </div>
                {/* </div> */}
                </ResizablePanel>                
            </ResizablePanelGroup>
            <form action={fetchOgTags} className="grid grid-cols-2 gap-2 p-5 border rounded-md morphic">
                <Input type="url" id="url" onChange={(e) => setUrl(e.target.value)} placeholder="Enter your website's URL" className="overflow-scroll"/>
                <Button type="submit">Fetch OG Tags</Button>
            </form>
        </div>
    ); 
}