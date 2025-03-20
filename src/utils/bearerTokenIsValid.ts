type BearerToken = {
    valid: boolean;
    token?: string;
}

export function BearerTokenIsValid(token: string | undefined | null): BearerToken {

    const valid: boolean = token ? token.startsWith("Bearer ") : false;

    return {
        token: valid && token ? token : undefined,
        valid
    };
}