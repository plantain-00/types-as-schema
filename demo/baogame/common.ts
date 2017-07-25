export const tileWidth = 40;
export const tileHeight = 40;
export const itemSize = 15;
export const userWidth = 40;
export const userHeight = 40;
export const tw = 28;
export const th = 15;
export const w = tw * tileWidth;
export const h = th * tileHeight;

export const enum ItemType {
    power = 0,
    gun = 1,
    mine = 2,
    drug = 3,
    hide = 4,
    bomb = 5,
    doublejump = 6,
    flypack = 7,
    grenade = 8,
}

export const itemCounts = [1000, 3, 2, 4, 1000, 550, 0, 250, 3];

export type Item = {
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type uint32
     */
    y: number;
    type: ItemType;
    dead: boolean;
};

export type Mine = {
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type uint32
     */
    y: number;
    dead: boolean;
};

export type Grenade = {
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type uint32
     */
    y: number;
    /**
     * @type uint32
     */
    r: number;
};

export type User = {
    itemType?: ItemType;
    /**
     * @type uint32
     */
    itemCount: number;
    nearLadder?: Ladder;
    /**
     * @type int32
     */
    faceing: number;
    /**
     * @type uint32
     */
    fireing?: number;
    /**
     * @type uint32
     */
    grenadeing: number;
    danger: boolean,
    status: UserStatus;
    name: string;
    /**
     * @type uint32
     */
    id: number;
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type uint32
     */
    y: number;
    /**
     * @type uint32
     */
    vy: number;
    /**
     * @type uint32
     */
    score: number;
    dead: boolean,
    doubleJumping: boolean,
    /**
     * @type uint32
     */
    flying: number;
};

export type Door = {
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type uint32
     */
    y: number;
};

export type ItemGate = {
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type float
     */
    y: number;
};

export const enum ProtocolKind {
    tick = 0,
    initSuccess = 1,
    join = 2,
    joinSuccess = 3,
    control = 4,
    explode = 5,
    userDead = 6,
}

type Tick = {
    users: User[];
    items: Item[];
    mines: Mine[];
    grenades: Grenade[];
};

export type MapData = {
    /**
     * @type uint32
     */
    w: number;
    /**
     * @type uint32
     */
    h: number;
    /**
     * @type uint32
     */
    floors: number[];
    ladders: Ladder[];
    doors: Door[],
    itemGates: ItemGate[],
};

type InitSuccess = {
    map: MapData;
};

type Join = {
    userName: string;
};

type JoinSuccess = {
    /**
     * @type uint32
     */
    userId: number;
};

export type Control = {
    /**
     * @type uint32
     */
    leftDown: number;
    /**
     * @type uint32
     */
    rightDown: number;
    /**
     * @type uint32
     */
    upDown: number;
    /**
     * @type uint32
     */
    downDown: number;
    /**
     * @type uint32
     */
    itemDown: number;
    leftPress: boolean;
    rightPress: boolean;
    upPress: boolean;
    downPress: boolean;
    itemPress: boolean;
};

export type ControlProtocol = {
    kind: ProtocolKind.control;
    control: Control;
};

type Explode = {
    /**
     * @type uint32
     */
    x: number;
    /**
     * @type uint32
     */
    y: number;
    /**
     * @type uint32
     */
    power: number;
};

type UserDead = {
    user: User;
    killer?: User;
};

export type Protocol =
    {
        kind: ProtocolKind.initSuccess;
        initSuccess: InitSuccess;
    }
    |
    {
        kind: ProtocolKind.join;
        join: Join;
    }
    |
    {
        kind: ProtocolKind.joinSuccess;
        joinSuccess: JoinSuccess;
    }
    |
    {
        kind: ProtocolKind.control;
        control: Control;
    }
    |
    {
        kind: ProtocolKind.tick;
        tick: Tick;
    }
    |
    {
        kind: ProtocolKind.explode;
        explode: Explode;
    }
    |
    {
        kind: ProtocolKind.userDead;
        userDead: UserDead;
    };

export const enum UserStatus {
    dieing = 0,
    climbing = 1,
    rolling2 = 2,
    standing = 3,
    rolling = 4,
    mining = 5,
    crawling = 6,
    falling = 7,
}

export type Ladder = { // (x,y1) until (x,y2)
    /**
     * @type float
     */
    x: number;
    /**
     * @type uint32
     */
    y1: number;
    /**
     * @type uint32
     */
    y2: number;
};
