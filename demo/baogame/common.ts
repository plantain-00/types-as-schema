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

type uint32 = number;

export type Item = {
    x: uint32;
    y: uint32;
    type: ItemType;
    dead: boolean;
};

export type Mine = {
    x: uint32;
    y: uint32;
    dead: boolean;
};

export type Grenade = {
    x: uint32;
    y: uint32;
    r: uint32;
};

type int32 = number;

export type User = {
    itemType?: ItemType;
    itemCount: uint32;
    nearLadder?: Ladder;
    faceing: int32;
    fireing?: uint32;
    grenadeing: uint32;
    danger: boolean,
    status: UserStatus;
    name: string;
    id: uint32;
    x: uint32;
    y: uint32;
    vy: uint32;
    score: uint32;
    dead: boolean,
    doubleJumping: boolean,
    flying: uint32;
};

export type Door = {
    x: uint32;
    y: uint32;
};

export type ItemGate = {
    x: uint32;
    y: float;
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
    w: uint32;
    h: uint32;
    floors: uint32[];
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
    userId: uint32;
};

export type Control = {
    leftDown: uint32;
    rightDown: uint32;
    upDown: uint32;
    downDown: uint32;
    itemDown: uint32;
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
    x: uint32;
    y: uint32;
    power: uint32;
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

type float = number;

export type Ladder = { // (x,y1) until (x,y2)
    x: float;
    y1: uint32;
    y2: uint32;
};
