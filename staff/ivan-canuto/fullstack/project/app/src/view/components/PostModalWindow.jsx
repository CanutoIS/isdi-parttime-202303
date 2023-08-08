import { useEffect, useState } from "react";
import { ModalContainer } from "../library";
import { useHandleErrors } from "../hooks";
import { retrievePost, retrieveUser } from "../../logic";
import { context } from "../../ui";
import { ContextualMenu } from "../components";

export default function PostModalWindow({
  handleOpenEditPost,
  handleOpenDeletePost,
  handleToggleVisibility,
  handleCloseModal
}) {
  const handleErrors = useHandleErrors();

  const [post, setPost] = useState();
  const [user, setUser] = useState();
  const [contextualMenu, setContextualMenu] = useState("close");

  useEffect(() => {
    console.log("PostModalWindow -> render");

    handleRefreshPost();
    handleRefreshUser();
  }, []);

  const handleRefreshUser = () => {
    handleErrors(async () => {
      const user = await retrieveUser();

      setUser(user);
    });
  };

  const handleRefreshPost = () => {
    handleErrors(async () => {
      const post = await retrievePost(context.postId);
        console.log(post);
      setPost(post);
    });
  };

  const handleToggleLike = () => {
    handleErrors(async () => {
      await toggleLikePost(id)

      handleRefreshPosts()
    })
  }

  const handleToggleFav = () => {
    handleErrors(async () => {
      await toggleSavePost(id)

      handleRefreshPosts()
      handleRefreshUser()
    })
  }

  const toggleContextualMenu = () => {
    context.postId = id;
    document.body.classList.toggle("fixed-scroll");
    setContextualMenu(contextualMenu === "close" ? "open" : "close");
  };

  return (
    <ModalContainer className="bg-black h-screen bg-opacity-50 absolute z-20 top-0 left-0">
      {contextualMenu === "open" && (
        <ContextualMenu
          options={[
            { text: "Edit post", onClick: handleOpenEditPost },
            { text: "Delete post", onClick: handleOpenDeletePost },
            {
              text: `Set post ${post && post.visible ? "private" : "public"}`,
              onClick: handleToggleVisibility,
            },
          ]}
          toggleContextualMenu={toggleContextualMenu}
        />
      )}

      {post && (
        <section className="w-11/12 h-full my-10 bg-white rounded-lg flex flex-col items-center">
          <div className="w-full flex justify-between p-2">

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined w-8" onClick={handleCloseModal}>arrow_back</span>
              <img
                className="h-8 w-8 object-cover rounded-full"
                src={post.author.avatar}
                alt="post-user-avatar"
              />
              <p className="px-1">{post.author.name}</p>
            </div>

            <div className="flex items-center">
              {user && post.author.id === user.id && (
                <>
                  <p className="mx-1">{post.visible ? "Public" : "Private"}</p>
                  <span
                    className="material-symbols-outlined hover:bg-gray-300 cursor-pointer font-black"
                    onClick={toggleContextualMenu}
                  >
                    more_vert
                  </span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-3xl mb-4">{post.title}</h1>

          <p className="px-2">{post.text}</p>

          <div className="p-2 w-full flex justify-between">
            <div>
                <div className='flex gap-2'>
                    <i className="" onClick={handleToggleFav}>
                        {user && post.fav ? <span className="material-symbols-outlined cursor-pointer filled saved">bookmark</span> : <span className="material-symbols-outlined cursor-pointer">bookmark</span>}
                    </i>

                    <i>
                        <span className="material-symbols-outlined cursor-pointer" onClick={() => {
                            context.postId = id
                            setModal('comments')
                        }}>mode_comment</span>
                    </i>
                    
                    <i className="" onClick={handleToggleLike}>
                        {user && post.liked ? <span className="material-symbols-outlined cursor-pointer filled liked">favorite</span> : <span className="material-symbols-outlined cursor-pointer">favorite</span>}
                    </i>
                </div>

                <p>{post.likes ? post.likes.length + ' likes' : '0 likes'}</p>
            </div>
            <p className="ml-2">{post.date}</p>
          </div>
        </section>
      )}
    </ModalContainer>
  );
}
