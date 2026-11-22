export type ButtonType = 'ACTION' | 'WIDGET' | 'LIVE DATA' | 'FOLDER' | 'WORKSPACE' | 'MACRO';

export interface MacroStep {
    command: string;
    args?: string | any[];
    delay?: number;
}

export interface ButtonPayload {
    command?: string;
    args?: any;
    sensor?: 'cpu' | 'ram' | string;
    steps?: MacroStep[];
}

export interface TileItem {
    id: string | number;
    title: string;
    color: string;
    type?: ButtonType;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    payload?: ButtonPayload;
}

export interface LayoutGrid {
    columns: number;
    rows: number;
}

export interface LayoutItem {
    id: string;
    name: string;
    grid?: LayoutGrid;
    buttons?: TileItem[];
}

export interface FullLayoutConfig {
    active_layout_id: string;
    layouts: LayoutItem[];
}

export interface AudioApp {
    App: string;
    Volume: number;
    isMuted?: number;
}

export interface AudioVolumeData {
    count?: number;
    apps?: AudioApp[];
    ilosc?: number;
    aplikacje?: AudioApp[];
}

export interface HardwareData {
    cpu: number | string;
    ram: number | string;
}

export interface ParsedQrData {
    ip: string;
    secret: string;
}
