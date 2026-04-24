import { MetricPanel } from './MetricPanel'

export function ProcessPanel({ name }) {
    return (
        <>
            <MetricPanel label={`${name} CPU`} endpoint={`/api/${name}/cpu`} unit="%" />
            <MetricPanel label={`${name} memory`} endpoint={`/api/${name}/memory`} unit=" MB" />
            <MetricPanel label={`${name} procs`} endpoint={`/api/${name}/procs`} unit="" />
        </>
    );
}
