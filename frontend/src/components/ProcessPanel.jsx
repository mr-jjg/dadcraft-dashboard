import { MetricPanel } from './MetricPanel'
import { ChartPanel } from './ChartPanel';

export function ProcessPanel({ name }) {
    return (
        <>
            <MetricPanel label={`${name} uptime`} endpoint={`/api/${name}/uptime`} unit="uptime" />
            <MetricPanel label={`${name} CPU`} endpoint={`/api/${name}/cpu`} unit="%" precision={1} />
            <MetricPanel label={`${name} memory`} endpoint={`/api/${name}/memory`} unit=" MB" />
            <ChartPanel label={`${name} memory range`} endpoint={`/api/${name}/memory/range`} unit=" MB" />
            <MetricPanel label={`${name} procs`} endpoint={`/api/${name}/procs`} unit="" />
        </>
    );
}
