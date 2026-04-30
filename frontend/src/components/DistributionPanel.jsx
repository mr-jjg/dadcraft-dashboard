import { useDistribution } from "../hooks/useDistributions";

export function DistributionPanel({ heading, endpoint}) {
    const { distribution, error } = useDistribution(endpoint);
    if (error) return <p>Error: {error.message}</p>;
    if (distribution == null) return <p>Loading...</p>;
    return (
        <>
            <p>{heading}</p>
            <ul>
                {distribution.map(({label, value}) => (
                    <li key={label}>{label}: {value}</li>
                ))}
            </ul>
        </>
    )
}
