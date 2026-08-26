interface GraphQLResponse<TData> {
    data?: TData
    errors?: Array<{ message: string }>
}

export const querySubgraph = async <TData, TVariables extends Record<string, unknown>>(
    url: string,
    query: string,
    variables: TVariables
): Promise<TData> => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
        throw new Error(`Subgraph request failed: ${response.status} ${response.statusText}`)
    }

    const result = (await response.json()) as GraphQLResponse<TData>
    if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join("; "))
    }
    if (!result.data) {
        throw new Error("Subgraph response did not include data")
    }

    return result.data
}
