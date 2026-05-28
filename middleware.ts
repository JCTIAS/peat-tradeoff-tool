import { next } from '@vercel/functions'

const DEFAULT_BASIC_AUTH = 'Thinks:@DEMO2026PEAT'
const REALM = 'Lowland Peat Trade-Off Explorer'

type BasicAuthCredentials = {
  user: string
  pass: string
}

export const config = {
  matcher: '/:path*',
}

export default function middleware(request: Request) {
  if (isAuthenticated(request)) {
    return next()
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
    },
  })
}

function isAuthenticated(request: Request) {
  const suppliedCredentials = parseAuthorizationHeader(request)
  const expectedCredentials = getExpectedCredentials()

  return (
    suppliedCredentials?.user === expectedCredentials.user &&
    suppliedCredentials.pass === expectedCredentials.pass
  )
}

function getExpectedCredentials(): BasicAuthCredentials {
  const rawCredentials = process.env.HTTP_BASIC_AUTH || DEFAULT_BASIC_AUTH
  const separatorIndex = rawCredentials.indexOf(':')

  if (separatorIndex === -1) {
    return { user: rawCredentials, pass: '' }
  }

  return {
    user: rawCredentials.slice(0, separatorIndex),
    pass: rawCredentials.slice(separatorIndex + 1),
  }
}

function parseAuthorizationHeader(request: Request) {
  const authorization = request.headers.get('authorization')

  if (!authorization) return null

  const [scheme, encodedCredentials] = authorization.split(' ')

  if (scheme.toLowerCase() !== 'basic' || !encodedCredentials) {
    return null
  }

  try {
    const decodedCredentials = atob(encodedCredentials)
    const separatorIndex = decodedCredentials.indexOf(':')

    if (separatorIndex === -1) {
      return null
    }

    return {
      user: decodedCredentials.slice(0, separatorIndex),
      pass: decodedCredentials.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}
