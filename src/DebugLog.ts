const DEBUG_MODE: boolean = false;

export function debugLog(_str: string): void {
    if(!DEBUG_MODE) return;
    // tslint:disable-next-line:no-console
    console.log(`[MHDD-DBG] ${_str}`);
}

export function debugLogObj(_obj: object): void {
    if(!DEBUG_MODE) return;
    // tslint:disable-next-line:no-console
    console.log(`[MHDD-DBG] %O`, _obj);
}
