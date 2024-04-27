import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function validateURL(url: string) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?'+ // port
    '(\\/[-a-z\\d%_.~+]*)*'+ // path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    const isValid = urlPattern.test(url);
    if(isValid) return url;
    return null;
}

async function getOgTags(url: string) : Promise<Record<string, string> | Error >{
    try {
        const validatedUrl = validateURL(url);
        if(!validatedUrl){
            return new Error('Invalid URL');
        }
        const fetchUrl = await fetch(validatedUrl);
        const html = await fetchUrl.text();
        const $ = cheerio.load(html);
        const ogAndTwitterTags: Record<string, string> = {};
        $('meta[property^="og:"]').each((i, elem) => {
            const property = $(elem).attr('property');
            const content = $(elem).attr('content');
            if(property && content) ogAndTwitterTags[property] = content;
        });
        $('meta[name^="twitter:"]').each((i, elem) => {
            const name = $(elem).attr('name');
            const content = $(elem).attr('content');
            if(name && content) ogAndTwitterTags[name] = content;
        });
        return ogAndTwitterTags;
    } catch (error : any) {
        return error;
    }
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    if(!url) return NextResponse.json({error: 'Please provide a url query parameter'}, {status: 400});
    try {
        const ogTags = await getOgTags(url);
        if(ogTags instanceof Error) return NextResponse.json({error: ogTags.message}, {status: 400});
        return NextResponse.json({ogTags},{status:200});
    } catch (error) {
        return NextResponse.json({'error': 'An error occurred'}, {status: 500});
    }
}