import { useEffect, useState } from "react"
import { Container, Button, SpeechBubble, Loader } from "../library"
import { useAppContext, useHandleErrors } from "../hooks"
import { askForResponse, retrieveConversation, storeInputInDB, generateConversation, generateSummary, createPost } from "../../logic"
import { context } from "../../ui"

export default function Chatbot({ handleLastPostsUpdate, lastPostsUpdate }) {
    const handleErrors = useHandleErrors()
    const { navigate } = useAppContext()

    const [modal, setModal] = useState(null)
    const [menu, setMenu] = useState(false)
    const [openedMenu, setOpenedMenu] = useState(false)
    const [messages, setMessages] = useState([])
    const [valueToRender, setValueToRender] = useState(null)
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        if(context.conversationId) {
            const getConversations = () => {
                handleErrors(async () => {
                    
                        const conversation = await retrieveConversation(context.conversationId)

                        setMessages([...conversation.messages])
                    })
                }
                
            getConversations()
        }
        else setMessages([])

        console.log('Chatbot -> render')
    }, [lastPostsUpdate])

    const handleOpenProfile = () => {
        document.body.classList.add("fixed-scroll")
        setModal("profile")
    }

    const handleReturnToHome = () => {
        document.body.classList.remove('fixed-scroll')
        navigate('/')
    }

    const handleSubmit = async event => {
        event.preventDefault()

        handleErrors(async () => {
            const userInput = typeof event.target.userInput !== 'undefined' ? event.target.userInput.value : event.target.value

            // let userInput
            // if(typeof event.target.userInput.value !== undefined) userInput = event.target.userInput.value
            // else userInput = event.target.value

            if (!userInput) return

            if (!context.conversationId) context.conversationId = await generateConversation(userInput)

            const newUserInput = {
                role: 'user',
                content: userInput
            }

            const loaderInput = {
                role: 'assistant',
                content: <Loader/>
            }

            const currentMessages = [...messages]

            currentMessages.push(newUserInput, loaderInput)
            
            setMessages(currentMessages)
            
            await storeInputInDB(context.conversationId, newUserInput)

            const messagesToAsk = [...currentMessages]

            messagesToAsk.pop()
            
            const response = await askForResponse(context.conversationId, messagesToAsk)
            
            setValueToRender(response.content)

            const voidMessage = { role: 'assistant', content: ''}

            setMessages([...messagesToAsk, voidMessage])
        })

        typeof event.target.userInput !== 'undefined' ? event.target.userInput.value = '' : event.target.value = ''
        // if(typeof event.target.userInput.value !== undefined) event.target.userInput.value = ''
        //     else event.target.value = ''
    }

    const renderTypeWriterText = () => {
        const text = valueToRender
        const conversationContainer = document.querySelector('.conversation-container')

        const speechBubbles = document.querySelectorAll('.speechBubble')
        const lastSpeechBubbleContainer = speechBubbles[speechBubbles.length - 1]
        const lastSpeechBubble = lastSpeechBubbleContainer.firstElementChild
        lastSpeechBubble.classList.add('blinking-cursor')

        let i = 0

        const interval = setInterval(() => {
            lastSpeechBubble.textContent += text.slice(i - 1, i)

            if (text.length === i) {
                clearInterval(interval)

                lastSpeechBubble.classList.remove('blinking-cursor')

                setValueToRender(null)
            }

            i++
            conversationContainer.scrollTop = conversationContainer.scrollHeight
        }, 20)
    }

    if(valueToRender) renderTypeWriterText(valueToRender)

    const handleShowOldConversation = async conversationId => {
        const conversation = await retrieveConversation(conversationId)

        setMessages([...messages, ...conversation.conversationInputs])
    }

    const handleGenerateSummary = async () => {
        if(context.conversationId) {
            const summary = await generateSummary(context.conversationId)
            
            setSummary(summary)
        }
    }

    const handleKeyDown = event => {
        if(event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }

    const handleDeleteSummary = () => {
        setSummary(null)
    }

    const handleGeneratePost = () => {
        handleErrors(async () => {
            await createPost(summary, context.conversationId)

            navigate('/')
        })
    }

    return <Container className="absolute top-0 left-0 bg-[url(src/images/chatbot-3.1.jpg)] bg-fixed bg-center bg-cover">
        <button className="fixed right-4 top-24 w-28 z-10 mt-2 bg-yellow-100 leading-tight border border-black" onClick={handleGenerateSummary}>Generate summary</button>
        
        <section className={`conversation-container absolute top-24 w-full ${!summary ? 'bottom-32' : ''} overflow-y-scroll`}>
            {/* <SpeechBubble
                role={'assistant'}
                content={'Hello! How can I help you?'}
            /> */}
            <section className='w-full flex justify-start'>
                <p className="p-4 mx-4 my-2 rounded-lg bg-green-300 rounded-tl-none">Hello! How can I help you?</p>
            </section>
            {messages && messages.map((message, index) => 
                <SpeechBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                />
            )}
            {summary && <div className="flex flex-col items-center gap-2 bg-red-300 rounded-lg pt-4 mx-4 py-2 my-2">
                <h1>Summary</h1>
                <SpeechBubble className='py-0 px-0'
                    role={'sumamry'}
                    content={summary}
                />
                <div className="flex justify-around p-2 gap-2">
                    <Button className="border border-black leading-tight" onClick={handleGeneratePost}>Create post with this summary</Button>
                    <Button className="border border-black leading-tight" onClick={handleGenerateSummary}>Generate another summary</Button>
                    <Button className="border border-black leading-tight" onClick={handleDeleteSummary}>Continue with conversation</Button>
                </div>
            </div>
            }
        </section>

        {!summary && <form className="border-black border-2 flex flex-row p-2 fixed bottom-4 gap-2" onSubmit={handleSubmit}>
            {/* <textarea className="w-72 p-4 focus:outline-none" name='userInput' placeholder='Send a message' /> */}
            <textarea className="w-72 p-4 focus:outline-none" name='userInput' placeholder='Send a message' autoFocus onKeyDown={handleKeyDown}/>
            <Button><span className="material-symbols-outlined">send</span></Button>
        </form>}
    </Container>
}