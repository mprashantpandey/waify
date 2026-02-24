import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { RouteName } from 'ziggy-js';
import { route } from '../../vendor/tightenco/ziggy';
import { getPlatformName } from '@/lib/branding';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => {
            const branding = (page.props as any)?.branding;
            const appName = getPlatformName(branding);
            return title ? `${title} - ${appName}` : appName;
        },
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.tsx`,
                import.meta.glob('./Pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            /* eslint-disable */
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location)});
            /* eslint-enable */

            return <App {...props} />;
        }}),
);
