"use client"

import { useEffect, useRef, useState } from "react"
import { createChat } from "@n8n/chat"
import { IToken, ParticipantProfile } from "@/types/auth"

/**
 * Configurações contextuais por rota
 */
const ROUTE_CONTEXTS = {
    '/dashboard': {
        title: 'Assistente TPE - Dashboard',
        subtitle: 'Precisa de ajuda com métricas e indicadores?',
        initialMessages: [
            '📊 Olá! Como posso ajudar com o dashboard?',
            'Posso explicar métricas, gráficos ou qualquer dúvida sobre os dados apresentados.'
        ],
        context: 'dashboard'
    },
    '/grupos': {
        title: 'Assistente TPE - Grupos',
        subtitle: 'Dúvidas sobre gerenciamento de grupos?',
        initialMessages: [
            '👥 Precisa de ajuda com grupos?',
            'Posso auxiliar na criação, edição ou gerenciamento de grupos e participantes.'
        ],
        context: 'grupos'
    },
    '/designacao': {
        title: 'Assistente TPE - Designações',
        subtitle: 'Como posso ajudar com designações?',
        initialMessages: [
            '📋 Olá! Precisa de ajuda com designações?',
            'Posso auxiliar na criação, gerenciamento ou dúvidas sobre o processo de designação.'
        ],
        context: 'designacao'
    },
    '/lista-designacao': {
        title: 'Assistente TPE - Lista de Designações',
        subtitle: 'Dúvidas sobre a lista de designações?',
        initialMessages: [
            '📝 Como posso ajudar com a lista de designações?',
            'Posso explicar filtros, status ou qualquer funcionalidade da lista.'
        ],
        context: 'lista-designacao'
    },
    '/peticoes': {
        title: 'Assistente TPE - Petições',
        subtitle: 'Precisa de ajuda com petições?',
        initialMessages: [
            '📄 Olá! Como posso ajudar com petições?',
            'Posso auxiliar no upload, visualização ou processo de petições.'
        ],
        context: 'peticoes'
    },
    '/pontos': {
        title: 'Assistente TPE - Pontos',
        subtitle: 'Dúvidas sobre o sistema de pontos?',
        initialMessages: [
            '🎯 Precisa de ajuda com pontos?',
            'Posso explicar como funciona o sistema de pontuação e acompanhamento.'
        ],
        context: 'pontos'
    },
    '/consultar': {
        title: 'Assistente TPE - Consultas',
        subtitle: 'Como posso ajudar com consultas?',
        initialMessages: [
            '🔍 Olá! Precisa de ajuda com consultas?',
            'Posso auxiliar na busca e visualização de informações no sistema.'
        ],
        context: 'consultar'
    }
} as const

/**
 * Tradução de perfis para contexto
 */
const PROFILE_CONTEXT = {
    [ParticipantProfile.ADMIN_ANALYST]: {
        suffix: ' (Analista Admin)',
        capabilities: 'Acesso completo ao sistema'
    },
    [ParticipantProfile.COORDINATOR]: {
        suffix: ' (Coordenador)',
        capabilities: 'Gerenciamento de grupos e designações'
    },
    [ParticipantProfile.CAPTAIN]: {
        suffix: ' (Capitão)',
        capabilities: 'Liderança de grupos'
    },
    [ParticipantProfile.ASSISTANT_CAPTAIN]: {
        suffix: ' (Assistente de Capitão)',
        capabilities: 'Apoio na liderança de grupos'
    },
    [ParticipantProfile.PARTICIPANT]: {
        suffix: ' (Participante)',
        capabilities: 'Visualização e participação'
    }
} as const

export interface TPEChatProps {
    /**
     * Dados do usuário logado
     */
    user?: IToken | null

    /**
     * Rota atual para personalização contextual
     */
    currentPath?: string

    /**
     * Modo de exibição do chat
     */
    mode?: 'window' | 'fullscreen'

    /**
     * URL do webhook do n8n
     */
    webhookUrl?: string

    /**
     * Seletor CSS do container alvo
     */
    target?: string

    /**
     * Configurações avançadas personalizadas
     */
    customConfig?: Record<string, any>

    /**
     * Se deve mostrar logs de debug
     */
    debug?: boolean
}

/**
 * Componente de Chat personalizado para TPE Digital
 * 
 * Integra o @n8n/chat com personalização completa seguindo
 * o design system TPE e funcionalidades contextuais.
 */
export function TPEChat({
    user,
    currentPath = '/',
    mode = 'window',
    webhookUrl = 'https://auto.wfelipe.com.br/webhook/b270fe93-ddad-4700-9ada-3ff7e0614365/chat',
    target = '#n8n-chat',
    customConfig = {},
    debug = false
}: TPEChatProps) {
    const [isMobile, setIsMobile] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const initRef = useRef(false)

    /**
     * Detecta se é dispositivo móvel
     */
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            if (debug) {
                console.log('[TPEChat] Mobile detected:', mobile)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => {
            window.removeEventListener('resize', checkMobile)
        }
    }, [debug])

    /**
     * Obtém configuração contextual baseada na rota
     */
    const getRouteContext = () => {
        // Busca por correspondência exata primeiro
        if (ROUTE_CONTEXTS[currentPath as keyof typeof ROUTE_CONTEXTS]) {
            return ROUTE_CONTEXTS[currentPath as keyof typeof ROUTE_CONTEXTS]
        }

        // Busca por correspondência parcial (ex: /grupos/novo -> /grupos)
        const matchingRoute = Object.keys(ROUTE_CONTEXTS).find(route =>
            currentPath?.startsWith(route)
        )

        if (matchingRoute) {
            return ROUTE_CONTEXTS[matchingRoute as keyof typeof ROUTE_CONTEXTS]
        }

        // Contexto padrão
        return {
            title: 'Assistente TPE Digital',
            subtitle: 'Como posso ajudá-lo hoje?',
            initialMessages: [
                '👋 Olá! Bem-vindo ao TPE Digital',
                'Sou seu assistente virtual. Como posso ajudá-lo hoje?'
            ],
            context: 'general'
        }
    }

    /**
     * Obtém informações do perfil do usuário
     */
    const getUserContext = () => {
        if (!user) {
            return {
                profile: 'guest',
                name: 'Visitante'
            }
        }

        const profileInfo = PROFILE_CONTEXT[user.profile as keyof typeof PROFILE_CONTEXT] || {
            suffix: '',
            capabilities: 'Acesso básico'
        }

        return {
            profile: user.profile,
            name: user.name || 'Usuário',
            capabilities: profileInfo.capabilities,
            suffix: profileInfo.suffix
        }
    }

    /**
     * Monta metadados para envio ao n8n
     */
    const buildMetadata = () => {
        const routeContext = getRouteContext()
        const userContext = getUserContext()

        return {
            // Informações do usuário
            userId: user?.sub || 'anonymous',
            userName: userContext.name,
            userProfile: userContext.profile,
            userCapabilities: userContext.capabilities,

            // Contexto da aplicação
            currentPath,
            routeContext: routeContext.context,
            systemVersion: '2.0.0',
            timestamp: new Date().toISOString(),

            // Informações técnicas
            isMobile,
            mode,
            userAgent: navigator.userAgent,
            language: 'pt-BR',

            // Configurações customizadas
            ...customConfig
        }
    }

    /**
     * Configuração completa do chat
     */
    const getChatConfig = () => {
        const routeContext = getRouteContext()
        const userContext = getUserContext()

        return {
            // Configuração básica
            webhookUrl,
            target,
            mode: isMobile && mode === 'window' ? 'fullscreen' : mode,

            // Configuração de sessão
            loadPreviousSession: true,
            chatSessionKey: `tpe_session_${user?.sub || 'anonymous'}`,
            chatInputKey: 'message',

            // Configuração de streaming - Habilitado para melhor UX
            enableStreaming: true, // Ativado no n8n também!

            // Tela de boas-vindas
            showWelcomeScreen: true,

            // Configuração de arquivos
            allowFileUploads: false, // Pode ser habilitado conforme necessidade
            allowedFilesMimeTypes: 'image/*,application/pdf',

            // Mensagens iniciais contextuais
            initialMessages: [...routeContext.initialMessages], // Spread para criar array mutável

            // Configuração de idioma PT-BR
            defaultLanguage: 'en' as const, // Mantém en por limitação da biblioteca
            i18n: {
                en: { // Usa en mas com textos em português
                    title: routeContext.title + userContext.suffix,
                    subtitle: routeContext.subtitle,
                    footer: 'TPE Digital © 2024',
                    getStarted: 'Nova Conversa',
                    inputPlaceholder: 'Digite sua mensagem...',
                    closeButtonTooltip: 'Fechar chat'
                }
            },

            // Metadados para contexto
            metadata: buildMetadata(),

            // Configuração do webhook com headers customizados
            webhookConfig: {
                method: 'POST' as const,
                headers: {
                    'Content-Type': 'application/json',
                    'X-TPE-Source': 'admin-app',
                    'X-TPE-Version': '2.0.0',
                    'X-TPE-User-Profile': user?.profile || 'anonymous',
                    'X-TPE-Route': currentPath || '/',
                    'Accept': 'application/json'
                }
            },

            // Merge com configurações customizadas
            ...customConfig
        }
    }

    /**
     * Inicializa o chat
     */
    useEffect(() => {
        // Evita inicialização dupla
        if (initRef.current || isInitialized) {
            return
        }

        // Aguarda o DOM estar pronto
        const timer = setTimeout(() => {
            try {
                const config = getChatConfig()

                if (debug) {
                    console.log('[TPEChat] Initializing with config:', config)
                }

                createChat(config)

                initRef.current = true
                setIsInitialized(true)

                if (debug) {
                    console.log('[TPEChat] Successfully initialized')
                    console.log('[TPEChat] Chat disponível em:', target)
                }
            } catch (error) {
                console.error('[TPEChat] Failed to initialize:', error)

                // Retry em caso de erro
                if (debug) {
                    console.log('[TPEChat] Tentando reinicializar em 2s...')
                    setTimeout(() => {
                        try {
                            createChat(getChatConfig())
                            setIsInitialized(true)
                            console.log('[TPEChat] Reinicialização bem-sucedida')
                        } catch (retryError) {
                            console.error('[TPEChat] Falha na reinicialização:', retryError)
                        }
                    }, 2000)
                }
            }
        }, 100)

        return () => {
            clearTimeout(timer)
        }
    }, [user, currentPath, isMobile, mode, webhookUrl, target, debug])

    // Log de debug para mudanças
    useEffect(() => {
        if (debug) {
            console.log('[TPEChat] Props changed:', {
                user: user?.name,
                currentPath,
                isMobile,
                mode,
                isInitialized,
                streaming: '✅ ATIVO'
            })
            console.log('🔄 [TPEChat] Streaming habilitado - respostas em tempo real!')
        }
    }, [user, currentPath, isMobile, mode, isInitialized, debug])

    // Este componente não renderiza nada - o chat é injetado pelo createChat
    return null
}

/**
 * Hook para usar o TPEChat facilmente
 */
export function useTPEChat(props: Omit<TPEChatProps, 'user' | 'currentPath'>) {
    return { TPEChat, props }
}

export default TPEChat